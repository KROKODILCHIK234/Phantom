import React from 'react';

const FeatureCard = ({ title, description, footerText }: { title: string, description: string, footerText: string }) => {
  return (
    <div className="group relative bg-[#13111A] border border-white/10 hover:border-purple-500/50 p-8 rounded-2xl transition-all duration-300 flex flex-col h-full overflow-hidden hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:-translate-y-1">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity"></div>
      
      <div className="relative z-10 flex-grow">
        <h3 className="text-xl font-bold text-[#8B5CF6] mb-4 leading-snug group-hover:text-white transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
      
      <div className="relative z-10 flex items-center justify-between mt-8 pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
        <span className="text-gray-500 text-xs font-medium group-hover:text-gray-400 transition-colors">{footerText}</span>
        <div className="flex items-center text-gray-600 group-hover:text-purple-400 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const featuresData = [
    {
      title: "Гибридное E2E-\nшифрование",
      description: "Каждая сессия защищена одновременно постквантовым Kyber и классическим X25519. Чтобы взломать соединение, нужно сломать оба алгоритма сразу.",
      footerText: "Постквантовая криптография"
    },
    {
      title: "Децентрализация\nпо умолчанию",
      description: "Phantom может работать без центрального сервера: клиенты находят друг друга через DHT, mDNS и relay-узлы. Сервер выступает только как fallback-транспорт.",
      footerText: "P2P-архитектура"
    },
    {
      title: "Отдельное\nклиентское ядро",
      description: "Ядро инкапсулирует всю криптографию, сеть и хранение. UI общается с ним через асинхронный API и события: можно строить свои клиенты, не переписывая протокол.",
      footerText: "Модульность"
    }
  ];

  return (
    <section className="py-32">
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Ключевые возможности</h2>
        <p className="text-gray-400 text-sm max-w-3xl leading-relaxed">
          Phantom сочетает гибридное шифрование, децентрализованный P2P-транспорт и модульную архитектуру, чтобы обеспечить долгосрочную безопасность и отказоустойчивость.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {featuresData.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

export default Features;
