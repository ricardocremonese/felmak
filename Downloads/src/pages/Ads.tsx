
import React from "react";
import { LayoutGrid, Ticket } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Ads = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-realEstate-blue mb-2">Anúncios</h1>
          <p className="text-gray-600">
            Gerencie seus anúncios em diferentes plataformas de marketing digital
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/a1879f95-5491-4787-bbe4-86e46d1d6557.png" 
                  alt="Facebook Ads" 
                  className="h-6 w-6"
                />
                Facebook Ads
              </CardTitle>
              <CardDescription>
                Crie e gerencie anúncios no Facebook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Conectar com Facebook
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-6 w-6 text-green-500" />
                Google Ads
              </CardTitle>
              <CardDescription>
                Crie e gerencie anúncios no Google
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Conectar com Google
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-6 w-6 text-black" />
                TikTok Ads
              </CardTitle>
              <CardDescription>
                Crie e gerencie anúncios no TikTok
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Conectar com TikTok
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Ads;
