import { NextRequest, NextResponse } from 'next/server';
import { cleanupChatAttachments, loadAttachmentMetadata } from '@/backend/services/chat/attachments.service';
import fs from 'fs/promises';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; filename: string }> },
) {
  const { id, filename } = await context.params;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token é obrigatório' }, { status: 400 });
  }

  const attachment = await loadAttachmentMetadata(id);

  if (!attachment) {
    return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
  }

  if (!attachment.token || attachment.token !== token) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }

  if (attachment.expiresAt && attachment.expiresAt < Date.now()) {
    await cleanupChatAttachments([attachment]);
    return NextResponse.json({ error: 'Arquivo expirado' }, { status: 410 });
  }

  const buffer = await fs.readFile(attachment.path);

  const response = new NextResponse(buffer, {
    headers: {
      'Content-Type': attachment.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.name) || 'arquivo'}"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });

  // Remover arquivo após o download ser iniciado
  cleanupChatAttachments([attachment]).catch((error) => {
    console.warn('[Chat Attachments] Falha ao limpar arquivo após download', error);
  });

  return response;
}

