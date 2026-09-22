import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { createSignal, Show } from 'solid-js';
import { Check, Copy, Eye, Plus, Save, Trash, X } from 'lucide-solid';
import EmptyState from './feedback/empty-state.component.tsx';
import ErrorState from './feedback/error-state.component.tsx';
import LoadingState from './feedback/loading-state.component.tsx';
import RetryErrorState from './feedback/retry-error-state.component.tsx';
import StatusBadge from './feedback/status-badge.component.tsx';
import Alert from './feedback/alert.component.tsx';
import DestructiveConfirmation from './feedback/destructive-confirmation.component.tsx';
import Select from './forms/select.component.tsx';
import Field from './forms/field.component.tsx';
import TagSelector from './forms/tag-selector.component.tsx';
import SearchCombobox from './forms/search-combobox.component.tsx';
import Surface from './surfaces/surface.component.tsx';
import PreviewDialog from './dialogs/preview-dialog.component.tsx';
import DestructiveDialog from './dialogs/destructive-dialog.component.tsx';
import Drawer from './drawers/drawer.component.tsx';
import NavigationDrawer from './drawers/navigation-drawer.component.tsx';
import { Menu } from '@ark-ui/solid/menu';

type Density = 'default' | 'compact';

export default function DesignSystemCatalog() {
  const [pressed, setPressed] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [density, setDensity] = createSignal<Density>('default');
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [destructiveOpen, setDestructiveOpen] = createSignal(false);
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [tags, setTags] = createSignal<string[]>(['solidjs', 'ark-ui']);
  const [searchValue, setSearchValue] = createSignal('');
  const [navigationOpen, setNavigationOpen] = createSignal(false);

  const simulateLoading = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div class="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <header class="grid max-w-3xl gap-3">
        <p class="text-eyebrow">DevHub UI</p>
        <h1 class="heading-page">
          Design system catalog
        </h1>
        <p class="text-lead">
          Laboratório dos componentes compartilhados. Esta página exercita contratos, variantes e estados antes da
          migração das features.
        </p>
      </header>

      <section class="grid gap-4" aria-labelledby="catalog-actions">
        <h2 id="catalog-actions" class="heading-section">
          Ações
        </h2>
        <Surface variant="elevated" padding="lg" class="grid gap-6">
          <div class="flex flex-wrap items-center gap-2">
            <button class="action action-primary action-compact">
              <Plus class="size-4" aria-hidden="true" /> Pequeno
            </button>
            <button class="action action-primary">
              <Save class="size-4" aria-hidden="true" /> Salvar
            </button>
            <button class="action action-primary action-large">
              Ação principal
            </button>
            <button class="action action-secondary">Secundário</button>
            <button class="action action-ghost">Ghost</button>
            <button class="action action-danger">
              <Trash class="size-4" aria-hidden="true" /> Excluir
            </button>
            <button disabled class="action action-secondary">
              Disabled
            </button>
            <button onClick={simulateLoading} aria-busy={loading()} disabled={loading()} class="action action-primary">
              Loading
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <a href="#catalog-surfaces" class="action action-primary">
              Link primary
            </a>
            <a href="#catalog-surfaces" class="action action-secondary action-compact">
              Link secondary
            </a>
            <button type="button" aria-label="Copiar valor" class="action action-icon">
              <Copy class="size-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Fechar" class="action action-icon">
              <X class="size-4" aria-hidden="true" />
            </button>
            <ToggleButton pressed={pressed()} onClick={() => setPressed((value) => !value)}>
              {pressed() ? <Check class="size-4" aria-hidden="true" /> : <Eye class="size-4" aria-hidden="true" />}
              {pressed() ? 'Ativo' : 'Inativo'}
            </ToggleButton>
            <button onClick={() => setDialogOpen(true)} class="action action-secondary">
              Abrir dialog
            </button>
            <button onClick={() => setDestructiveOpen(true)} class="action action-danger-outline">
              Confirmação destrutiva
            </button>
            <Drawer
              open={drawerOpen()}
              onOpenChange={setDrawerOpen}
              titleId="catalog-drawer-title"
              title="Drawer Ark UI"
              description="Painel lateral para navegação contextual ou ações relacionadas."
              trigger={(triggerProps) => (
                <button
                  {...triggerProps}
                  type="button"
                  class="action action-secondary"
                >
                  Abrir drawer
                </button>
              )}
            >
              <div class="grid gap-3 rounded-2xl border border-line bg-surface-subtle p-4 text-sm text-content-muted">
                <strong class="text-content">Contrato demonstrado</strong>
                <span>Backdrop, Escape, foco preso, restauração de foco e gesto de arraste pertencem ao Ark UI.</span>
              </div>
            </Drawer>
            <NavigationDrawer
              open={navigationOpen()}
              onOpenChange={setNavigationOpen}
              titleId="catalog-navigation-title"
              title="Navegação"
              activeHref="/components"
              groups={[
                {
                  label: 'Principal',
                  items: [
                    { label: 'Início', href: '/', icon: <Eye class="size-4" /> },
                    { label: 'Componentes', href: '/components', icon: <Plus class="size-4" /> },
                  ],
                },
                {
                  label: 'Conta',
                  items: [{ label: 'Sair', href: '/logout', tone: 'danger', icon: <X class="size-4" /> }],
                },
              ]}
              trigger={(triggerProps) => (
                <button
                  {...triggerProps}
                  type="button"
                  class="action action-secondary"
                >
                  Navegação mobile
                </button>
              )}
            />
            <Menu.Root>
              <Menu.Trigger class="action action-secondary">
                Abrir menu
              </Menu.Trigger>
              <Menu.Positioner class="z-50">
                <Menu.Content class="grid min-w-48 gap-1 rounded-2xl border border-line bg-surface-overlay p-2 shadow-ui-overlay">
                  <Menu.Item
                    value="first"
                    class="cursor-pointer rounded-xl px-3 py-2 text-sm text-content hover:bg-surface-subtle"
                  >
                    Primeira ação
                  </Menu.Item>
                  <Menu.Item
                    value="second"
                    class="cursor-pointer rounded-xl px-3 py-2 text-sm text-content hover:bg-surface-subtle"
                  >
                    Segunda ação
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </div>
        </Surface>
      </section>

      <Show when={dialogOpen()}>
        <PreviewDialog
          titleId="catalog-dialog-title"
          closeLabel="Fechar"
          onClose={() => setDialogOpen(false)}
          header={
            <h2 id="catalog-dialog-title" class="heading-section">
              Dialog Ark UI
            </h2>
          }
        >
          <p class="text-body">O foco, Escape, backdrop e fechamento são controlados pelo Ark UI.</p>
        </PreviewDialog>
      </Show>

      <DestructiveDialog
        open={destructiveOpen()}
        onOpenChange={setDestructiveOpen}
        titleId="catalog-destructive-title"
        accessibleLabel="Confirmação destrutiva"
        title="Excluir este item?"
        description="Esta ação não pode ser desfeita. Confirme apenas se tiver certeza."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={() => setDestructiveOpen(false)}
      />

      <section class="grid gap-4" aria-labelledby="catalog-forms">
        <h2 id="catalog-forms" class="heading-section">
          Formulários
        </h2>
        <Surface variant="elevated" padding="lg" class="grid gap-5 md:grid-cols-2">
          <Field>
            <label for="catalog-name" class="field-label">Nome</label>
            <input id="catalog-name" placeholder="Digite seu nome" aria-describedby="catalog-name-help"  class="field-control"/>
            <span id="catalog-name-help" class="field-description">Como devemos chamar você.</span>
          </Field>
          <Field>
            <label for="catalog-invalid" class="field-label">Campo inválido</label>
            <input
              id="catalog-invalid"
              aria-invalid="true"
              value="valor inválido"
              aria-describedby="catalog-invalid-error"
             class="field-control"/>
            <span id="catalog-invalid-error" role="alert" class="field-error">Revise este valor.</span>
          </Field>
          <Field>
            <label for="catalog-description" class="field-label">Descrição</label>
            <textarea id="catalog-description" rows="4" placeholder="Escreva uma descrição"  class="field-control resize-y"/>
          </Field>
          <Field>
            <label id="catalog-select-label" for="catalog-select" class="field-label">
              Seleção
            </label>
            <Select
              id="catalog-select"
              value={density()}
              aria-labelledby="catalog-select-label"
              aria-describedby="catalog-select-help"
              options={[
                { value: 'default', label: 'Densidade padrão' },
                { value: 'compact', label: 'Densidade compacta' },
              ]}
              onChange={setDensity}
            />
            <span id="catalog-select-help" class="field-description">Selecionado: {density()}</span>
          </Field>
          <div class="md:col-span-2">
            <TagSelector id="catalog-tags" label="Tags" value={tags()} onChange={setTags} />
          </div>
          <div class="md:col-span-2">
            <SearchCombobox
              id="catalog-search"
              label="Busca com resultados"
              placeholder="Buscar componentes"
              inputValue={searchValue()}
              options={[
                { value: 'button', label: 'Button', description: 'Ações simples' },
                { value: 'dialog', label: 'Dialog', description: 'Conteúdo modal' },
                { value: 'drawer', label: 'Drawer', description: 'Painel lateral' },
              ]}
              onInputValueChange={setSearchValue}
            />
          </div>
        </Surface>
      </section>

      <section class="grid gap-4" id="catalog-surfaces" aria-labelledby="catalog-surfaces-heading">
        <h2 id="catalog-surfaces-heading" class="heading-section">
          Superfícies e status
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          <Surface variant="base" padding="md" class="grid gap-3">
            <h3 class="heading-card">
              Superfície base
            </h3>
            <p class="text-muted">Conteúdo comum e agrupamentos neutros.</p>
            <div class="flex flex-wrap gap-2">
              <StatusBadge>Neutro</StatusBadge>
              <StatusBadge status="accent">Accent</StatusBadge>
              <StatusBadge status="success">Sucesso</StatusBadge>
              <StatusBadge status="warning">Atenção</StatusBadge>
              <StatusBadge status="danger">Perigo</StatusBadge>
              <StatusBadge status="info">Informação</StatusBadge>
            </div>
          </Surface>
          <Surface variant="inset" padding="md" class="grid gap-3">
            <h3 class="heading-card">
              Superfície inset
            </h3>
            <p class="text-muted">Área interna, código ou conteúdo secundário.</p>
            <p class="text-caption">Estado de densidade: {density()}</p>
          </Surface>
        </div>
      </section>

      <section class="grid gap-4" aria-labelledby="catalog-feedback">
        <h2 id="catalog-feedback" class="heading-section">
          Feedback e recuperação
        </h2>
        <div class="grid gap-3 md:grid-cols-2">
          <Alert status="info" title="Informação">
            A alteração será aplicada ao próximo carregamento.
          </Alert>
          <Alert status="success" title="Concluído">
            O item foi salvo com sucesso.
          </Alert>
          <Alert status="warning" title="Atenção">
            Você tem alterações não salvas.
          </Alert>
          <Alert status="danger" title="Não foi possível continuar">
            Verifique os campos e tente novamente.
          </Alert>
        </div>
        <Surface variant="elevated" padding="none" class="overflow-hidden">
          <LoadingState>Carregando conteúdo…</LoadingState>
          <EmptyState>
            <p class="text-muted">Nenhum resultado encontrado.</p>
          </EmptyState>
          <ErrorState role="alert">Não foi possível carregar este conteúdo.</ErrorState>
          <RetryErrorState message="A conexão falhou." retryLabel="Tentar novamente" onRetry={() => undefined} />
          <DestructiveConfirmation
            accessibleLabel="Confirmação de exclusão"
            title="Excluir item?"
            description="Esta ação pode ser difícil de reverter."
            confirmLabel="Excluir"
            cancelLabel="Cancelar"
            busy={false}
            onConfirm={() => undefined}
            onCancel={() => undefined}
          />
        </Surface>
      </section>
    </div>
  );
}
