import { Check, Star, Zap, Rocket } from 'lucide-react'

export default function AdminPlansPage() {
  const plans = [
    {
      name: 'Básico',
      price: 'Grátis',
      desc: 'Para quem está começando',
      icon: Zap,
      color: 'bg-gray-100 text-gray-600',
      features: ['Posição no mapa', 'Descrição da loja', 'Link para WhatsApp', 'Até 5 fotos'],
      current: true
    },
    {
      name: 'Profissional',
      price: 'R$ 49/mês',
      desc: 'Destaque sua marca',
      icon: Star,
      color: 'bg-palmas-blue/10 text-palmas-blue',
      features: ['Tudo do Básico', 'Banner personalizado', 'Destaque no mapa', 'Relatórios de visitas', 'Link para Instagram'],
      popular: true
    },
    {
      name: 'Premium',
      price: 'R$ 99/mês',
      desc: 'O poder máximo da feira',
      icon: Rocket,
      color: 'bg-palmas-dark text-white',
      features: ['Tudo do Profissional', 'QR Code exclusivo', 'Suporte prioritário 24h', 'Anúncios na Home', 'Acesso à API'],
    }
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-palmas-text">Planos e Assinaturas</h1>
        <p className="text-gray-600 mt-1">Potencialize o alcance da sua loja na feira digital</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card p-8 flex flex-col relative overflow-hidden transition-all hover:shadow-xl ${plan.popular ? 'border-2 border-palmas-blue ring-4 ring-palmas-blue/5' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-palmas-blue text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Mais Popular
              </div>
            )}

            <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center mb-6 shadow-sm`}>
              <plan.icon size={24} />
            </div>

            <h3 className="font-display text-2xl font-bold text-gray-800">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-palmas-text">{plan.price}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2 mb-8">{plan.desc}</p>

            <div className="space-y-4 mb-8 flex-1">
              {plan.features.map(feat => (
                <div key={feat} className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-green-600" />
                  </div>
                  {feat}
                </div>
              ))}
            </div>

            <button
              disabled={plan.current}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${plan.current
                  ? 'bg-gray-100 text-gray-400 cursor-default'
                  : 'btn-primary shadow-lg hover:-translate-y-1'
                }`}
            >
              {plan.current ? 'Seu Plano Atual' : 'Fazer Upgrade'}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison info */}
      <div className="mt-12 p-6 bg-white border border-gray-100 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-16 h-16 bg-palmas-blue/10 rounded-full flex items-center justify-center text-palmas-blue flex-shrink-0">
          <Zap size={30} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-gray-800">Precisa de um plano customizado?</h4>
          <p className="text-sm text-gray-500 mt-1">Se você gerencia múltiplas bancas ou representa uma associação, entre em contato com nosso time comercial.</p>
        </div>
        <button className="btn-secondary whitespace-nowrap px-8 py-3 font-bold border-2">Falar com Suporte</button>
      </div>
    </div>
  )
}
