
import React from "react";
import { Globe, Megaphone, MessageSquare, Mail } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";

const Marketing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 relative overflow-hidden">
        <div className="relative z-10 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Marketing
            </h1>
            <p className="text-gray-600 mb-8">
              Gerencie suas estratégias de marketing digital
            </p>
          </div>
        </div>

        {/* Cards Grid with Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {/* Sites de Corretores Card */}
          <div className="card-container group">
            <div className="card bg-white">
              <div className="front-content">
                <div className="flex flex-col items-center gap-3">
                  <Globe className="h-12 w-12 text-blue-600 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                    Sites de Corretores
                  </p>
                </div>
              </div>
              <div 
                onClick={() => navigate('/agent-websites')}
                className="content bg-gradient-to-r from-blue-500 to-blue-700"
              >
                <p className="heading">Sites de Corretores</p>
                <p className="line-clamp-4">
                  Crie e gerencie sites personalizados para seus corretores, aumentando sua presença online e alcance de mercado.
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo para Redes Card */}
          <div className="card-container group">
            <div className="card bg-white">
              <div className="front-content">
                <div className="flex flex-col items-center gap-3">
                  <MessageSquare className="h-12 w-12 text-pink-600 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                    Conteúdo para Redes
                  </p>
                </div>
              </div>
              <div 
                onClick={() => navigate('/marketing/social-media')}
                className="content bg-gradient-to-r from-pink-500 to-pink-700"
              >
                <p className="heading">Conteúdo para Redes</p>
                <p className="line-clamp-4">
                  Crie conteúdo envolvente para suas redes sociais e mantenha sua presença digital sempre atualizada.
                </p>
              </div>
            </div>
          </div>

          {/* E-mail Marketing Card */}
          <div className="card-container group">
            <div className="card bg-white">
              <div className="front-content">
                <div className="flex flex-col items-center gap-3">
                  <Mail className="h-12 w-12 text-orange-600 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                    E-mail Marketing
                  </p>
                </div>
              </div>
              <div 
                onClick={() => navigate('/marketing/email')}
                className="content bg-gradient-to-r from-orange-500 to-orange-700"
              >
                <p className="heading">E-mail Marketing</p>
                <p className="line-clamp-4">
                  Envie campanhas de e-mail personalizadas para seus leads e clientes com templates profissionais.
                </p>
              </div>
            </div>
          </div>

          {/* Anúncios Card */}
          <div className="card-container group">
            <div className="card bg-white">
              <div className="front-content">
                <div className="flex flex-col items-center gap-3">
                  <Megaphone className="h-12 w-12 text-purple-600 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
                    Anúncios
                  </p>
                </div>
              </div>
              <div 
                onClick={() => navigate('/marketing/ads')}
                className="content bg-gradient-to-r from-purple-500 to-purple-700"
              >
                <p className="heading">Anúncios</p>
                <p className="line-clamp-4">
                  Gerencie seus anúncios no Meta Ads e maximize seu retorno sobre investimento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
