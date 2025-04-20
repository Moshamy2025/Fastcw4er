import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { getIngredientSubstitutes } from "@/lib/api";
import { SubstitutionResponse } from "@/lib/types";

export function IngredientSubstitution() {
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SubstitutionResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [commonIngredients, setCommonIngredients] = useState<string[]>([
    "دقيق", "سكر", "زبدة", "بيض", "حليب", "زيت زيتون", 
    "خل", "ملح", "فلفل", "بصل", "ثوم", "طماطم", "ليمون"
  ]);

  const fetchSubstitutes = async (ingredient: string) => {
    if (!ingredient.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the API function instead of direct fetch
      const data = await getIngredientSubstitutes(ingredient);
      setResults(data);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [ingredient, ...prev.filter(item => item !== ingredient)].slice(0, 5);
        return updated;
      });
      
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching substitutes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSubstitutes(ingredientQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card className="w-full shadow-md overflow-hidden">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🔄</span> بدائل المكونات
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-grow">
              <Input
                placeholder="أدخل اسم المكون للبحث عن بدائله..."
                value={ingredientQuery}
                onChange={(e) => setIngredientQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!ingredientQuery.trim() || isLoading}
              className="bg-secondary hover:bg-secondary-dark"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">بحث</span>
            </Button>
          </div>
          
          {error && (
            <Alert className="mt-4 bg-red-50 border border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <Tabs defaultValue="common">
          <TabsList className="w-full">
            <TabsTrigger value="common" className="flex-1">مكونات شائعة</TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">عمليات بحث سابقة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="common" className="py-2">
            <div className="flex flex-wrap gap-2">
              {commonIngredients.map((ingredient, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIngredientQuery(ingredient);
                    fetchSubstitutes(ingredient);
                  }}
                  className="hover:bg-primary/10 transition-colors"
                >
                  {ingredient}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="py-2">
            {recentSearches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((ingredient, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIngredientQuery(ingredient);
                      fetchSubstitutes(ingredient);
                    }}
                    className="hover:bg-primary/10 transition-colors"
                  >
                    {ingredient}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic text-center py-2">
                لم تقم بأي عمليات بحث بعد
              </p>
            )}
          </TabsContent>
        </Tabs>
        
        {results && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-3">بدائل لـ "{results.originalIngredient}"</h3>
            
            {results.substitutes.length > 0 ? (
              <ul className="space-y-3">
                {results.substitutes.map((substitute, index) => (
                  <li key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                    <div className="flex items-start">
                      <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-1 text-xs">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium">{substitute.name}</div>
                        <div className="text-sm text-gray-600">
                          النسبة: {substitute.ratio}
                        </div>
                        {substitute.notes && (
                          <div className="text-sm text-gray-500 mt-1 italic">
                            {substitute.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                لم نجد بدائل لهذا المكون. حاول البحث عن مكون آخر.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default IngredientSubstitution;