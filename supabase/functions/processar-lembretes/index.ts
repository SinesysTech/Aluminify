import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuracao do servidor invalida" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time and calculate reminder window
    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
    const reminderWindowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

    console.log("Processing reminders for window:", {
      start: reminderWindowStart.toISOString(),
      end: reminderWindowEnd.toISOString()
    });

    // Fetch confirmed appointments within the reminder window that haven't had reminders sent
    const { data: agendamentos, error: fetchError } = await supabase
      .from('agendamentos')
      .select(`
        id,
        professor_id,
        aluno_id,
        data_inicio,
        data_fim,
        link_reuniao,
        lembrete_enviado
      `)
      .eq('status', 'confirmado')
      .eq('lembrete_enviado', false)
      .gte('data_inicio', reminderWindowStart.toISOString())
      .lte('data_inicio', reminderWindowEnd.toISOString());

    if (fetchError) {
      console.error("Error fetching agendamentos:", fetchError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar agendamentos", details: fetchError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!agendamentos || agendamentos.length === 0) {
      console.log("No appointments found requiring reminders");
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "Nenhum lembrete a enviar" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${agendamentos.length} appointments requiring reminders`);

    let processedCount = 0;
    let errorCount = 0;

    for (const agendamento of agendamentos) {
      try {
        // Create reminder notification for professor
        const { error: notifProfError } = await supabase
          .from('agendamento_notificacoes')
          .insert({
            agendamento_id: agendamento.id,
            tipo: 'lembrete',
            destinatario_id: agendamento.professor_id
          });

        if (notifProfError) {
          console.error("Error creating professor notification:", notifProfError);
        }

        // Create reminder notification for student
        const { error: notifAlunoError } = await supabase
          .from('agendamento_notificacoes')
          .insert({
            agendamento_id: agendamento.id,
            tipo: 'lembrete',
            destinatario_id: agendamento.aluno_id
          });

        if (notifAlunoError) {
          console.error("Error creating student notification:", notifAlunoError);
        }

        // Call the notification edge function to send emails
        const functionUrl = `${supabaseUrl}/functions/v1/enviar-notificacao-agendamento`;

        // Send to professor
        await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            agendamento_id: agendamento.id,
            tipo: 'lembrete',
            destinatario_id: agendamento.professor_id
          })
        });

        // Send to student
        await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            agendamento_id: agendamento.id,
            tipo: 'lembrete',
            destinatario_id: agendamento.aluno_id
          })
        });

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('agendamentos')
          .update({
            lembrete_enviado: true,
            lembrete_enviado_em: new Date().toISOString()
          })
          .eq('id', agendamento.id);

        if (updateError) {
          console.error("Error updating agendamento:", updateError);
          errorCount++;
        } else {
          processedCount++;
        }

      } catch (error) {
        console.error("Error processing agendamento:", agendamento.id, error);
        errorCount++;
      }
    }

    console.log(`Processed ${processedCount} reminders, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
        total: agendamentos.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
});
