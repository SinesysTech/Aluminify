"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Student } from "@/types/shared/entities/user";
import { deleteStudentAction } from "../actions";

interface DeleteStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteStudentDialog({
  student,
  open,
  onOpenChange,
}: DeleteStudentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!student) return;

    setIsDeleting(true);
    try {
      const result = await deleteStudentAction(student.id);

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        alert(result.error || "Erro ao excluir aluno");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Erro ao excluir aluno. Verifique o console para mais detalhes.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o aluno{" "}
            <strong>{student?.fullName || student?.email}</strong>?
            <br />
            <br />
            Esta acao ira desativar o acesso do aluno a plataforma. Os dados
            serao mantidos para historico e podem ser recuperados se necessario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
