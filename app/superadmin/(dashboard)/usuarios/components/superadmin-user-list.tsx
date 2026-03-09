"use client";

import { useState, useEffect, useCallback } from "react";

interface SuperadminRow {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function SuperadminUserList() {
  const [users, setUsers] = useState<SuperadminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SuperadminRow | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/usuarios");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
    );
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR");
  }

  function openCreateForm() {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(user: SuperadminRow) {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingUser(null);
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (editingUser) {
        // Update
        const res = await fetch(
          `/api/superadmin/usuarios/${editingUser.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: formName, email: formEmail }),
          },
        );
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Erro ao atualizar");
          return;
        }
      } else {
        // Create
        if (!formPassword) {
          setFormError("Senha é obrigatória para novo usuário");
          return;
        }
        const res = await fetch("/api/superadmin/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            password: formPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Erro ao criar");
          return;
        }
      }

      closeForm();
      await fetchUsers();
    } catch {
      setFormError("Erro de conexão");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleActive(user: SuperadminRow) {
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/superadmin/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao alterar status");
        return;
      }
      await fetchUsers();
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
            <div className="h-4 w-48 bg-muted rounded mb-2" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <button
          onClick={openCreateForm}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Novo Superadmin
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h3 className="font-semibold">
            {editingUser ? "Editar Superadmin" : "Novo Superadmin"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            {!editingUser && (
              <div className="max-w-sm">
                <label className="text-sm font-medium">Senha</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            )}
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {formLoading
                  ? "Salvando..."
                  : editingUser
                    ? "Salvar"
                    : "Criar"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Criado em
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Nenhum superadmin encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(user)}
                        className="text-sm text-primary hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={actionLoading === user.id}
                        className={`text-sm hover:underline disabled:opacity-50 ${
                          user.active
                            ? "text-destructive"
                            : "text-green-600"
                        }`}
                      >
                        {actionLoading === user.id
                          ? "..."
                          : user.active
                            ? "Desativar"
                            : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        {filtered.length} superadmin{filtered.length !== 1 ? "s" : ""}{" "}
        {search ? "(filtrado)" : ""}
      </div>
    </div>
  );
}
