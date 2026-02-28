import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateShop } from '../hooks/useShops';
import { Input } from '../components/FormElements';
import { Button } from '../components/FormElements';
import { Alert } from '../components/FormElements';

export function CreateShopPage() {
  const navigate = useNavigate();
  const createShop = useCreateShop();

  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    address: '',
    phone: '',
    pix_key: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate required fields
    if (!formData.slug.trim() || !formData.name.trim()) {
      return;
    }

    try {
      const shop = await createShop.mutateAsync({
        slug: formData.slug,
        name: formData.name,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        pix_key: formData.pix_key || undefined,
      });

      // Redirect to shop management page
      navigate(`/shop/${shop.id}`);
    } catch (error: any) {
      console.error('Error creating shop:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Crie Sua Barbearia
            </h1>
            <p className="text-xl text-slate-600">
              Configure sua loja e comece a receber agendamentos
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {createShop.isError && (
              <div className="mb-6">
                <Alert
                  variant="error"
                  title="Erro ao criar barbearia"
                >
                  {createShop.error instanceof Error
                    ? createShop.error.message
                    : 'Ocorreu um erro. Tente novamente.'}
                </Alert>
              </div>
            )}

            {createShop.isSuccess && (
              <div className="mb-6">
                <Alert variant="success" title="Sucesso!">
                  Sua barbearia foi criada com sucesso.
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  URL da Barbearia *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">https://horacerta.com/</span>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="minha-barbearia"
                    error={
                      submitted && !formData.slug.trim()
                        ? 'Campo obrigatório'
                        : undefined
                    }
                    helper="Apenas letras minúsculas, números e hífens"
                  />
                </div>
              </div>

              {/* Shop Name */}
              <Input
                label="Nome da Barbearia *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: João Silva Barbearia"
                error={
                  submitted && !formData.name.trim()
                    ? 'Campo obrigatório'
                    : undefined
                }
              />

              {/* Address */}
              <Input
                label="Endereço"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua das Flores, 123, São Paulo, SP"
                helper="Opcional - pode ser adicionado depois"
              />

              {/* Phone */}
              <Input
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+5511999999999"
                helper="Formato: +55 11 99999-9999"
              />

              {/* PIX Key */}
              <Input
                label="Chave PIX"
                name="pix_key"
                value={formData.pix_key}
                onChange={handleChange}
                placeholder="seu-email@example.com"
                helper="Para receber pagamentos. Pode ser email, CPF, telefone ou chave aleatória"
              />

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={createShop.isPending}
                  className="w-full"
                >
                  {createShop.isPending ? 'Criando barbearia...' : 'Criar Barbearia'}
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                <h3 className="font-semibold text-blue-900 mb-2">
                  ℹ️ Próximos passos:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Adicionar barbeiros à sua equipe</li>
                  <li>Configurar serviços oferecidos</li>
                  <li>Definir horário de funcionamento</li>
                  <li>Começar a receber agendamentos!</li>
                </ul>
              </div>
            </form>
          </div>

          {/* Link back */}
          <div className="text-center mt-8">
            <p className="text-slate-600">
              Já tem uma barbearia?{' '}
              <button
                onClick={() => navigate('/shops')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Ir para minhas barbearias
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
