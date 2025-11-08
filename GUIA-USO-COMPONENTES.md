# Guia de Uso dos Componentes e Utilitários

Este guia mostra como usar os novos componentes e utilitários criados.

---

## 🎯 Componentes Comuns

### LoadingSpinner

Spinner de carregamento reutilizável.

```tsx
import { LoadingSpinner } from '@/components/common';

// Spinner simples
<LoadingSpinner />

// Com mensagem
<LoadingSpinner message="Carregando dados..." />

// Tamanhos diferentes
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />

// Tela cheia
<LoadingSpinner fullScreen message="Aguarde..." />
```

### ErrorBoundary

Captura erros do React automaticamente.

```tsx
import { ErrorBoundary } from '@/components/common';

// Envolver a aplicação
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Com fallback customizado
<ErrorBoundary fallback={<MeuComponenteDeErro />}>
  <MinhaSecao />
</ErrorBoundary>
```

### EmptyState

Estado vazio padronizado.

```tsx
import { EmptyState } from '@/components/common';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={Inbox}
  title="Nenhuma análise encontrada"
  description="Crie sua primeira análise para começar"
  action={{
    label: "Nova Análise",
    onClick: () => handleNovaAnalise()
  }}
/>
```

### AccessibleLabel

Label com acessibilidade.

```tsx
import { AccessibleLabel } from '@/components/common';

<AccessibleLabel
  htmlFor="email"
  required
  description="Digite seu e-mail corporativo"
>
  E-mail
</AccessibleLabel>
<Input id="email" type="email" />
```

---

## 🪝 Hooks Customizados

### useAsync

Gerencia operações assíncronas.

```tsx
import { useAsync } from '@/hooks/useAsync';

function MeuComponente() {
  const { data, loading, error, execute } = useAsync<User>();

  const loadUser = async () => {
    await execute(() => fetchUser(userId));
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Erro: {error.message}</div>;
  if (!data) return <EmptyState title="Usuário não encontrado" />;

  return <div>{data.name}</div>;
}
```

### useFormValidation

Validação de formulários.

```tsx
import { useFormValidation } from '@/hooks/useFormValidation';
import { commonValidators } from '@/utils/validators';

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const { values, errors, handleChange, handleSubmit, isSubmitting } = 
    useFormValidation<FormData>({
      initialValues: { email: '', password: '' },
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (!commonValidators.email().validator(values.email)) {
          errors.email = 'E-mail inválido';
        }
        if (values.password.length < 6) {
          errors.password = 'Senha deve ter no mínimo 6 caracteres';
        }
        return errors;
      },
      onSubmit: async (values) => {
        await login(values);
      }
    });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Input
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {errors.email && <span>{errors.email}</span>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
```

---

## 🛠️ Utilitários

### Validators

Validadores reutilizáveis.

```tsx
import { 
  validateEmail, 
  validateSlug, 
  sanitizeSlug,
  commonValidators,
  createValidator 
} from '@/utils/validators';

// Validação simples
if (!validateEmail(email)) {
  console.error('E-mail inválido');
}

// Sanitizar slug
const slug = sanitizeSlug('Minha Organização 123'); 
// Resultado: 'minha-organizacao-123'

// Validador customizado
const validator = createValidator({
  name: [commonValidators.required('Nome')],
  email: [commonValidators.email()],
  age: [commonValidators.range('Idade', 18, 100)]
});

const errors = validator({ name: '', email: 'invalido', age: 15 });
// errors = { name: 'Nome é obrigatório', email: 'E-mail inválido', ... }
```

### Error Handler

Tratamento centralizado de erros.

```tsx
import { 
  logError, 
  logSuccess, 
  logWarning,
  handleApiError,
  getErrorMessage 
} from '@/utils/errorHandler';

async function carregarDados() {
  try {
    logInfo('Iniciando carregamento', 'Dashboard');
    const data = await fetchData();
    logSuccess('Dados carregados com sucesso', 'Dashboard');
    return data;
  } catch (error) {
    logError(error, 'Dashboard.carregarDados');
    const appError = handleApiError(error);
    toast({
      variant: 'destructive',
      title: 'Erro',
      description: getErrorMessage(appError)
    });
  }
}
```

### Accessibility

Utilitários de acessibilidade.

```tsx
import { 
  getFormAriaProps,
  announceToScreenReader,
  getClickableProps 
} from '@/utils/accessibility';

// Input com ARIA
<Input
  {...getFormAriaProps(!!errors.email, true, 'email-error')}
/>

// Anunciar para screen readers
announceToScreenReader('Dados salvos com sucesso', 'assertive');

// Elemento clicável acessível
<div {...getClickableProps(() => handleClick(), 'Abrir detalhes')}>
  Clique aqui
</div>
```

---

## 📝 Tipos TypeScript

### Common Types

```tsx
import type { 
  Organization,
  ThemeColors,
  AsyncState,
  FormErrors,
  LoadingState 
} from '@/types/common';

// Estado assíncrono
const [userState, setUserState] = useState<AsyncState<User>>({
  data: null,
  loading: false,
  error: null
});

// Erros de formulário
const [errors, setErrors] = useState<FormErrors>({});

// Estado de loading
const [status, setStatus] = useState<LoadingState>('idle');
```

---

## 🎨 Padrões de Componente

### Componente Básico

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  description?: string;
  className?: string;
}

export const MyComponent: React.FC<MyComponentProps> = React.memo(
  ({ title, description, className }) => {
    return (
      <div className={cn('p-4 rounded-lg', className)}>
        <h3 className="font-bold">{title}</h3>
        {description && <p>{description}</p>}
      </div>
    );
  }
);

MyComponent.displayName = 'MyComponent';
```

### Componente com Hook

```tsx
import React, { useCallback } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { LoadingSpinner, EmptyState } from '@/components/common';

interface DataListProps {
  endpoint: string;
}

export const DataList: React.FC<DataListProps> = React.memo(
  ({ endpoint }) => {
    const { data, loading, error, execute } = useAsync<Item[]>();

    const loadData = useCallback(async () => {
      await execute(() => fetch(endpoint).then(r => r.json()));
    }, [endpoint, execute]);

    useEffect(() => {
      loadData();
    }, [loadData]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Erro: {error.message}</div>;
    if (!data || data.length === 0) {
      return <EmptyState title="Nenhum item encontrado" />;
    }

    return (
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
);

DataList.displayName = 'DataList';
```

---

## 🚀 Exemplos Completos

### Formulário Completo

```tsx
import React from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { AccessibleLabel } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commonValidators, createValidator } from '@/utils/validators';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

const validator = createValidator({
  name: [commonValidators.required('Nome')],
  email: [commonValidators.email()],
  password: [
    commonValidators.required('Senha'),
    {
      validator: (v) => (v as string).length >= 8,
      message: 'Senha deve ter no mínimo 8 caracteres'
    }
  ]
});

export const RegisterForm: React.FC = () => {
  const { values, errors, handleChange, handleSubmit, isSubmitting } =
    useFormValidation<RegisterFormData>({
      initialValues: { name: '', email: '', password: '' },
      validate: validator,
      onSubmit: async (values) => {
        await registerUser(values);
      }
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <AccessibleLabel htmlFor="name" required>
          Nome
        </AccessibleLabel>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div>
        <AccessibleLabel htmlFor="email" required>
          E-mail
        </AccessibleLabel>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div>
        <AccessibleLabel htmlFor="password" required>
          Senha
        </AccessibleLabel>
        <Input
          id="password"
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </form>
  );
};
```

---

## 📚 Recursos Adicionais

- [Documentação React](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Hook Form](https://react-hook-form.com/)

---

**Última atualização:** 08/11/2025

