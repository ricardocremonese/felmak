import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AlertCircle, Copy, Link as LinkIcon, Loader2, Send, Settings, Share } from "lucide-react";
import { properties } from "@/data/mockData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AIProvider, generateOpenAiContent } from "@/utils/openAiService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ContentGenerator = () => {
  const [aiContent, setAiContent] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkContent, setLinkContent] = useState<string>("");
  const [isScrapingLink, setIsScrapingLink] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [groqApiKeyInput, setGroqApiKeyInput] = useState<string>("");
  const [aiProvider, setAiProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("openai_api_key") || "";
  });
  const [groqApiKey, setGroqApiKey] = useState<string>(() => {
    return localStorage.getItem("groq_api_key") || "";
  });
  const [openAiModel, setOpenAiModel] = useState<string>("gpt-4o");
  const [groqModel, setGroqModel] = useState<string>("llama3-70b-8192");
  const [openAiApiUrl, setOpenAiApiUrl] = useState<string>("");
  const [groqApiUrl, setGroqApiUrl] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  React.useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    }
  }, [apiKey]);

  React.useEffect(() => {
    if (groqApiKey) {
      localStorage.setItem("groq_api_key", groqApiKey);
    }
  }, [groqApiKey]);

  const generateContent = async () => {
    if (aiProvider === "openai" && !apiKey) {
      toast.error("Por favor, adicione sua chave da API OpenAI primeiro.");
      return;
    }

    if (aiProvider === "groq" && !groqApiKey) {
      toast.error("Por favor, adicione sua chave da API GROQ primeiro.");
      return;
    }

    if (!theme) {
      toast.error("Por favor, especifique um tema para o conteúdo.");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Crie um artigo de blog para o setor imobiliário sobre o tema: ${theme}. 
      O conteúdo deve ser informativo, engajante e otimizado para SEO.`;
      
      const content = await generateOpenAiContent({
        prompt,
        systemPrompt: "Você é um especialista em marketing imobiliário com habilidade em criar conteúdo relevante e otimizado para SEO.",
        temperature: 0.7,
        maxTokens: 1500,
        model: aiProvider === "openai" ? openAiModel : groqModel,
        provider: aiProvider,
        apiKey: aiProvider === "openai" ? apiKey : groqApiKey,
        apiBaseUrl: aiProvider === "openai" ? (openAiApiUrl || undefined) : (groqApiUrl || undefined),
        organizationId: aiProvider === "openai" ? (organizationId || undefined) : undefined
      });
      
      setAiContent(content);
      toast.success("Conteúdo gerado com sucesso!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Erro ao gerar conteúdo. Verifique sua chave da API ${aiProvider === "openai" ? "OpenAI" : "GROQ"}.`);
      setAiContent("Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePropertyContent = async () => {
    if (aiProvider === "openai" && !apiKey) {
      toast.error("Por favor, adicione sua chave da API OpenAI primeiro.");
      return;
    }

    if (aiProvider === "groq" && !groqApiKey) {
      toast.error("Por favor, adicione sua chave da API GROQ primeiro.");
      return;
    }

    if (!selectedProperty) {
      toast.error("Por favor, selecione um imóvel.");
      return;
    }

    setIsGenerating(true);
    try {
      const property = properties.find(p => p.id === selectedProperty);
      
      if (!property) {
        throw new Error("Imóvel não encontrado");
      }

      const prompt = `Crie uma descrição atraente para este imóvel:
      Título: ${property.title}
      Tipo: ${property.type}
      Preço: R$ ${property.price.toLocaleString('pt-BR')}
      Localização: ${property.address}
      Características: ${property.bedrooms} quartos, ${property.bathrooms} banheiros, ${property.squareMeters}m²
      
      A descrição deve destacar os benefícios do imóvel, a localização e as características mais atrativas. 
      Inclua um parágrafo de venda que desperte o interesse dos compradores.`;
      
      const content = await generateOpenAiContent({
        prompt,
        systemPrompt: "Você é um corretor de imóveis experiente com excelente habilidade em marketing imobiliário.",
        temperature: 0.7,
        maxTokens: 1000,
        model: aiProvider === "openai" ? openAiModel : groqModel,
        provider: aiProvider,
        apiKey: aiProvider === "openai" ? apiKey : groqApiKey,
        apiBaseUrl: aiProvider === "openai" ? (openAiApiUrl || undefined) : (groqApiUrl || undefined),
        organizationId: aiProvider === "openai" ? (organizationId || undefined) : undefined
      });
      
      setAiContent(content);
      toast.success("Descrição do imóvel gerada com sucesso!");
    } catch (error) {
      console.error("Error generating property content:", error);
      toast.error(`Erro ao gerar descrição do imóvel. Verifique sua chave da API ${aiProvider === "openai" ? "OpenAI" : "GROQ"}.`);
      setAiContent("Ocorreu um erro ao gerar a descrição do imóvel. Por favor, tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchLinkContent = async () => {
    if (!linkUrl) {
      toast.error("Por favor, insira um URL válido.");
      return;
    }

    if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
      toast.error("URL inválido. Certifique-se de incluir http:// ou https://");
      return;
    }

    setIsScrapingLink(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLinkContent("Este é um conteúdo simulado extraído do link fornecido. Em uma implementação real, o conteúdo seria extraído da página web e formatado adequadamente. Você poderia então editar este conteúdo antes de publicá-lo no seu site ou blog.");
      
      toast.success("Conteúdo extraído com sucesso!");
    } catch (error) {
      console.error("Error fetching link content:", error);
      toast.error("Erro ao extrair conteúdo do link.");
      setLinkContent("Ocorreu um erro ao extrair o conteúdo. Verifique se o URL é válido e acessível.");
    } finally {
      setIsScrapingLink(false);
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

  const saveApiKey = () => {
    if (!apiKeyInput) {
      toast.error("Por favor, insira uma chave da API OpenAI.");
      return;
    }
    
    setApiKey(apiKeyInput);
    setApiKeyInput("");
    toast.success("Chave da API OpenAI salva com sucesso!");
  };

  const saveGroqApiKey = () => {
    if (!groqApiKeyInput) {
      toast.error("Por favor, insira uma chave da API GROQ.");
      return;
    }
    
    setGroqApiKey(groqApiKeyInput);
    setGroqApiKeyInput("");
    toast.success("Chave da API GROQ salva com sucesso!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Gerador de Conteúdo</h1>
            <p className="text-muted-foreground mt-2">
              Crie conteúdo relevante para o setor imobiliário utilizando Inteligência Artificial ou importe conteúdo de links externos.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Provedor de IA</CardTitle>
              <CardDescription>
                Escolha qual provedor de IA você deseja utilizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    variant={aiProvider === "openai" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setAiProvider("openai")}
                  >
                    OpenAI
                  </Button>
                  <Button
                    variant={aiProvider === "groq" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setAiProvider("groq")}
                  >
                    GROQ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {(aiProvider === "openai" && !apiKey) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Chave da API OpenAI necessária</AlertTitle>
              <AlertDescription>
                Para usar o Gerador de Conteúdo com OpenAI, você precisa adicionar sua chave da API OpenAI.
              </AlertDescription>
            </Alert>
          )}

          {(aiProvider === "groq" && !groqApiKey) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Chave da API GROQ necessária</AlertTitle>
              <AlertDescription>
                Para usar o Gerador de Conteúdo com GROQ, você precisa adicionar sua chave da API GROQ.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Configuração da API</CardTitle>
                <CardDescription>
                  Conecte-se à API do provedor escolhido para gerar conteúdo
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                title="Configurações avançadas"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {aiProvider === "openai" ? (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      type="password"
                      placeholder="Insira sua chave da API OpenAI"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={saveApiKey}>Salvar Chave</Button>
                  </div>
                  
                  {apiKey && (
                    <p className="text-sm text-muted-foreground">
                      ✓ Chave da API OpenAI configurada
                    </p>
                  )}
                  
                  <Accordion type="single" collapsible className={!showAdvancedSettings ? "hidden" : ""}>
                    <AccordionItem value="advanced-settings">
                      <AccordionTrigger>Configurações Avançadas</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 mt-2">
                          <div className="space-y-2">
                            <Label htmlFor="openai-model">Modelo</Label>
                            <Select value={openAiModel} onValueChange={setOpenAiModel}>
                              <SelectTrigger id="openai-model">
                                <SelectValue placeholder="Selecione um modelo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                                <SelectItem value="gpt-4.5-preview">GPT-4.5-preview</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="openai-api-url">URL da API (opcional)</Label>
                            <Input
                              id="openai-api-url"
                              placeholder="https://api.openai.com/v1/chat/completions"
                              value={openAiApiUrl}
                              onChange={(e) => setOpenAiApiUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Deixe em branco para usar o endpoint padrão
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="organization-id">ID da Organização (opcional)</Label>
                            <Input
                              id="organization-id"
                              placeholder="org-..."
                              value={organizationId}
                              onChange={(e) => setOrganizationId(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Necessário apenas se você estiver usando uma conta com múltiplas organizações
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      type="password"
                      placeholder="Insira sua chave da API GROQ"
                      value={groqApiKeyInput}
                      onChange={(e) => setGroqApiKeyInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={saveGroqApiKey}>Salvar Chave</Button>
                  </div>
                  
                  {groqApiKey && (
                    <p className="text-sm text-muted-foreground">
                      ✓ Chave da API GROQ configurada
                    </p>
                  )}
                  
                  <Accordion type="single" collapsible className={!showAdvancedSettings ? "hidden" : ""}>
                    <AccordionItem value="advanced-settings">
                      <AccordionTrigger>Configurações Avançadas</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 mt-2">
                          <div className="space-y-2">
                            <Label htmlFor="groq-model">Modelo</Label>
                            <Select value={groqModel} onValueChange={setGroqModel}>
                              <SelectTrigger id="groq-model">
                                <SelectValue placeholder="Selecione um modelo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="llama3-70b-8192">LLaMA 3 70B</SelectItem>
                                <SelectItem value="llama3-8b-8192">LLaMA 3 8B</SelectItem>
                                <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="groq-api-url">URL da API (opcional)</Label>
                            <Input
                              id="groq-api-url"
                              placeholder="https://api.groq.com/openai/v1/chat/completions"
                              value={groqApiUrl}
                              onChange={(e) => setGroqApiUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Deixe em branco para usar o endpoint padrão
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="theme">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="theme">Por Tema</TabsTrigger>
              <TabsTrigger value="property">Por Imóvel</TabsTrigger>
              <TabsTrigger value="link">Via Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="theme">
              <Card>
                <CardHeader>
                  <CardTitle>Gerar Conteúdo por Tema</CardTitle>
                  <CardDescription>
                    Especifique um tema para gerar conteúdo relevante para o setor imobiliário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Tema</Label>
                      <Input
                        id="theme"
                        placeholder="Ex: Dicas para comprar um imóvel, Tendências do mercado imobiliário"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    onClick={generateContent} 
                    disabled={isGenerating || !theme || (aiProvider === "openai" && !apiKey) || (aiProvider === "groq" && !groqApiKey)}
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
                        Gerar Conteúdo com {aiProvider === "openai" ? "OpenAI" : "GROQ"}
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
            </TabsContent>
            
            <TabsContent value="property">
              <Card>
                <CardHeader>
                  <CardTitle>Gerar Conteúdo para Imóvel</CardTitle>
                  <CardDescription>
                    Selecione um imóvel do seu CRM para gerar uma descrição atrativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="property">Imóvel</Label>
                      <Select 
                        value={selectedProperty} 
                        onValueChange={setSelectedProperty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um imóvel" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.title} - {property.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    onClick={generatePropertyContent} 
                    disabled={isGenerating || !selectedProperty || (aiProvider === "openai" && !apiKey) || (aiProvider === "groq" && !groqApiKey)}
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
                        Gerar Descrição com {aiProvider === "openai" ? "OpenAI" : "GROQ"}
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
            </TabsContent>
            
            <TabsContent value="link">
              <Card>
                <CardHeader>
                  <CardTitle>Importar Conteúdo de Link</CardTitle>
                  <CardDescription>
                    Extraia conteúdo de um link externo para modificar e usar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="link">URL do Conteúdo</Label>
                      <div className="flex gap-2">
                        <Input
                          id="link"
                          placeholder="https://exemplo.com/artigo"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={fetchLinkContent} 
                          disabled={isScrapingLink || !linkUrl}
                          variant="outline"
                        >
                          {isScrapingLink ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LinkIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {linkContent && (
                      <div className="space-y-2">
                        <Label htmlFor="imported-content">Conteúdo Importado</Label>
                        <Textarea
                          id="imported-content"
                          value={linkContent}
                          onChange={(e) => setLinkContent(e.target.value)}
                          className="min-h-[200px]"
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(linkContent)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {aiContent && (
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo Gerado</CardTitle>
                <CardDescription>
                  Edite o conteúdo gerado conforme necessário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  className="min-h-[300px]"
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

export default ContentGenerator;
