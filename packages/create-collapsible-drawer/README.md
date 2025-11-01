# create-collapsible-drawer

## Download

```bash
npx @qedrohenrique/create-collapsible-drawer@latest
```

## Example

```tsx
"use client";

import { Button } from "@/components/ui/button";
import CollapsibleDrawer from "@/components/custom/collapsible-drawer";

export default function MyPageComponent() {
  return (
    <CollapsibleDrawer side="right" size="md">
      <CollapsibleDrawer.Trigger asChild>
        <Button>Open Drawer</Button>
      </CollapsibleDrawer.Trigger>
      <CollapsibleDrawer.Content>
        <CollapsibleDrawer.Header>
          <CollapsibleDrawer.Title>Título da Drawer</CollapsibleDrawer.Title>
        </CollapsibleDrawer.Header>
        <CollapsibleDrawer.Body>
          <p>Conteúdo da drawer aqui...</p>
        </CollapsibleDrawer.Body>
        <CollapsibleDrawer.Footer>
          <Button>Salvar</Button>
        </CollapsibleDrawer.Footer>
      </CollapsibleDrawer.Content>
    </CollapsibleDrawer>
  );
}
```

## Props

### CollapsibleDrawer (Root)

- `side?: "right" | "left" | "top" | "bottom"` - Posição da drawer (padrão: "right")
- `size?: "sm" | "md" | "lg"` - Tamanho da drawer (padrão: "md")
- `defaultOpen?: boolean` - Estado inicial aberto/fechado
- `open?: boolean` - Controle externo do estado aberto/fechado
- `onOpenChange?: (open: boolean) => void` - Callback quando o estado muda
