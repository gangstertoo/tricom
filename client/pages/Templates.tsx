import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Plus, Trash2 } from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const useTemplates = create(
  persist<{
    items: TemplateItem[];
    add: (t: Omit<TemplateItem, "id">) => void;
    remove: (id: string) => void;
  }>(
    (set, get) => ({
      items: [],
      add: (t) =>
        set({ items: [{ id: crypto.randomUUID(), ...t }, ...get().items] }),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
    }),
    { name: "email-templates", storage: createJSONStorage(() => localStorage) },
  ),
);

export default function TemplatesPage() {
  const { items, add, remove } = useTemplates();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const onAdd = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    add({ name: name.trim(), subject: subject.trim(), body: body.trim() });
    setName("");
    setSubject("");
    setBody("");
  };

  return (
    <AppShell>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label>Body (Markdown)</Label>
              <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" /> Save Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? (
              <div className="text-muted-foreground">No templates saved.</div>
            ) : (
              items.map((t) => (
                <div key={t.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.name}</div>
                    <Button variant="ghost" size="icon" onClick={() => remove(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">{t.subject}</div>
                  <pre className="text-sm whitespace-pre-wrap mt-2">{t.body}</pre>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
