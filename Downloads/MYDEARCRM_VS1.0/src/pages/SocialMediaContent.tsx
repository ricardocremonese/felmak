
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, Copy, Loader2, Send, ImageIcon, Facebook, Instagram, Share } from "lucide-react";
import { properties } from "@/data/mockData";
import { toast } from "sonner";
import { generateOpenAiContent } from "@/utils/openAiService";

const SocialMediaContent = () => {
  const [aiContent, setAiContent] = useState<string>("");
  const [propertyPrompt, setPropertyPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [platform, setPlatform] = useState<string>("instagram");
  const [contentType, setContentType] = useState<string>("post");
  const [contentLength, setContentLength] = useState<string>("curto");

  const OPENAI_API_KEY = "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";
  const OPENAI_ORG_ID = "org-8dt7bLLcu5XpprzcXErW81xb";
  const openAiModel = "gpt-4o";

  const generateContent = async () => {
    if (!propertyPrompt) {
      toast.error("Por favor, adicione uma descrição do conteúdo desejado.");
      return;
    }
    setIsGenerating(true);
    try {
      let prompt = "";
      let property = null;

      if (selectedProperty) {
        property = properties.find(p => p.id === selectedProperty);
      }

      if (platform === "instagram") {
        prompt = `Crie um ${contentLength === "curto" ? "breve" : "detalhado"} texto para uma ${contentType === "post" ? "postagem" : "história"} do Instagram `;
      } else {
        prompt = `Crie um ${contentLength === "curto" ? "breve" : "detalhado"} texto para uma ${contentType === "post" ? "postagem" : "anúncio"} do Facebook `;
      }

      if (property) {
        prompt += `sobre este imóvel: ${property.title}, localizado em ${property.address}, com ${property.bedrooms} quartos, ${property.bathrooms} banheiros, ${property.squareMeters}m², por R$ ${property.price.toLocaleString('pt-BR')}. `;
      }

      prompt += `Contexto adicional: ${propertyPrompt}. `;

      prompt += `O texto deve ser atrativo, incluir hashtags relevantes para o mercado imobiliário brasileiro, ${contentLength === "curto" ? "ser conciso e direto" : "detalhar benefícios e características"}, e ter call-to-action eficaz.`;

      const systemPrompt = "Você é um especialista em marketing imobiliário com experiência em criar conteúdo envolvente para redes sociais como Instagram e Facebook.";

      const content = await generateOpenAiContent({
        prompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 1000,
        model: openAiModel,
        provider: "openai",
        apiKey: OPENAI_API_KEY,
        organizationId: OPENAI_ORG_ID,
      });

      setAiContent(content);
      toast.success("Conteúdo gerado com sucesso!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Erro ao gerar conteúdo. Contate o administrador.");
      setAiContent("Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Conteúdo copiado para a área de transferência!");
  };

  const shareOnWhatsApp = () => {
    if (!aiContent) {
      toast.error("Gere um conteúdo primeiro para compartilhar!");
      return;
    }

    const text = encodeURIComponent(aiContent);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success("Compartilhando via WhatsApp!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Conteúdo para Redes Sociais</h1>
            <p className="text-muted-foreground mt-2">
              Crie conteúdo envolvente para Instagram e Facebook utilizando IA para promover seus imóveis.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Gerador de Conteúdo para Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plataforma</Label>
                    <div className="flex space-x-2">
                      <Button 
                        variant={platform === "instagram" ? "default" : "outline"} 
                        className="flex-1"
                        onClick={() => setPlatform("instagram")}
                      >
                        <Instagram className="mr-2 h-4 w-4" />
                        Instagram
                      </Button>
                      <Button 
                        variant={platform === "facebook" ? "default" : "outline"} 
                        className="flex-1"
                        onClick={() => setPlatform("facebook")}
                      >
                        <Facebook className="mr-2 h-4 w-4" />
                        Facebook
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Conteúdo</Label>
                    <div className="flex space-x-2">
                      <Button 
                        variant={contentType === "post" ? "default" : "outline"} 
                        className="flex-1"
                        onClick={() => setContentType("post")}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Post
                      </Button>
                      <Button 
                        variant={contentType === "story" ? "default" : "outline"} 
                        className="flex-1"
                        onClick={() => setContentType("story")}
                      >
                        {platform === "instagram" ? (
                          <Instagram className="mr-2 h-4 w-4" />
                        ) : (
                          <Facebook className="mr-2 h-4 w-4" />
                        )}
                        {platform === "instagram" ? "Story" : "Anúncio"}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tamanho do Conteúdo</Label>
                  <div className="flex space-x-2">
                    <Button 
                      variant={contentLength === "curto" ? "default" : "outline"} 
                      className="flex-1"
                      onClick={() => setContentLength("curto")}
                    >
                      Texto Curto
                    </Button>
                    <Button 
                      variant={contentLength === "longo" ? "default" : "outline"} 
                      className="flex-1"
                      onClick={() => setContentLength("longo")}
                    >
                      Texto Detalhado
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property">Selecione um Imóvel (opcional)</Label>
                  <Select 
                    value={selectedProperty} 
                    onValueChange={setSelectedProperty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum imóvel</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title} - {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt">Descrição do Conteúdo Desejado</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ex: Quero destacar a localização privilegiada, proximidade de escolas e parques, ideal para famílias jovens..."
                    value={propertyPrompt}
                    onChange={(e) => setPropertyPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={generateContent} 
                disabled={isGenerating || !propertyPrompt}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Gerar Conteúdo para {platform === "instagram" ? "Instagram" : "Facebook"}
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="bg-green-500 hover:bg-green-600 text-white border-0"
                onClick={shareOnWhatsApp}
                disabled={!aiContent}
              >
                <Share className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </CardFooter>
          </Card>

          {aiContent && (
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setAiContent("")}>
                  Limpar
                </Button>
                <Button onClick={() => copyToClipboard(aiContent)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar para Área de Transferência
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaContent;
