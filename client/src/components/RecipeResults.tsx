import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ingredient, Recipe } from "@/lib/types";
import { BookmarkPlus, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecipeResultsProps {
  recipes: Recipe[];
  isLoading: boolean;
  ingredients: Ingredient[];
}

export default function RecipeResults({
  recipes,
  isLoading,
  ingredients,
}: RecipeResultsProps) {
  const { user } = useAuth();
  const [savingRecipes, setSavingRecipes] = useState<{ [key: number]: boolean }>({});
  const [savedRecipes, setSavedRecipes] = useState<{ [key: number]: boolean }>({});
  
  const saveRecipe = async (recipe: Recipe, index: number) => {
    if (!user) {
      toast({
        title: "عذراً! لازم تعمل حساب الأول",
        description: "علشان تقدر تحفظ الوصفات، لازم تسجل دخول أو تعمل حساب جديد",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSavingRecipes(prev => ({ ...prev, [index]: true }));
      
      // تحقق ما إذا كانت الوصفة محفوظة بالفعل
      const checkResponse = await apiRequest("POST", `/api/users/${user.id}/saved-recipes/check`, {
        recipeData: recipe
      });
      
      const { isSaved } = await checkResponse.json();
      
      if (isSaved) {
        toast({
          title: "الوصفة محفوظة بالفعل!",
          description: "لقد قمت بحفظ هذه الوصفة من قبل",
        });
        setSavedRecipes(prev => ({ ...prev, [index]: true }));
        setSavingRecipes(prev => ({ ...prev, [index]: false }));
        return;
      }
      
      // حفظ الوصفة
      const recipeToSave = {
        recipeData: {
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          videoId: recipe.videoId
        },
        tags: []
      };
      
      const response = await apiRequest("POST", `/api/users/${user.id}/saved-recipes`, recipeToSave);
      
      if (response.ok) {
        toast({
          title: "تم حفظ الوصفة بنجاح!",
          description: "يمكنك العثور عليها في صفحة الوصفات المحفوظة",
        });
        setSavedRecipes(prev => ({ ...prev, [index]: true }));
      } else {
        toast({
          title: "حدث خطأ",
          description: "لم نتمكن من حفظ الوصفة، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ الوصفة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setSavingRecipes(prev => ({ ...prev, [index]: false }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="mb-8 text-center">
        <Card className="inline-block p-8 border-2 border-dashed border-primary/50">
          <CardContent className="flex flex-col items-center animate-pulse p-0">
            <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
            <p className="text-lg font-medium">استنى شوية بندور في المطبخ...</p>
            <p className="text-sm text-gray-500">بنطبخلك أحلى وصفات من مكوناتك، شوية وهيجهزوا 😋</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recipes.length === 0 && ingredients.length > 0) {
    return null;
  }

  return (
    <div id="recipes" className="mt-8 space-y-8">
      {recipes.map((recipe, index) => (
        <Card 
          key={index} 
          className="recipe-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-primary/20"
        >
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🍽️</span> {recipe.title}
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={savedRecipes[index] ? "secondary" : "outline"} 
                        size="sm"
                        onClick={() => saveRecipe(recipe, index)}
                        disabled={savingRecipes[index]}
                        className={`flex items-center gap-1 transition-all duration-300 ${savedRecipes[index] ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`}
                      >
                        {savingRecipes[index] ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : savedRecipes[index] ? (
                          <Save className="w-4 h-4 mr-1" />
                        ) : (
                          <BookmarkPlus className="w-4 h-4 mr-1" />
                        )}
                        {savedRecipes[index] ? "تم الحفظ" : "احفظ الوصفة"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {savedRecipes[index] 
                        ? "الوصفة محفوظة بالفعل!" 
                        : "احفظ هذه الوصفة في حسابك لتتمكن من العودة إليها لاحقًا"
                      }
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mb-4 text-gray-600 bg-primary/5 p-3 rounded-md italic">
                <p className="mb-2">{recipe.description}</p>
              </div>
              <div className="mb-6 bg-gray-50 p-4 rounded-md border-l-4 border-primary shadow-sm">
                <h4 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
                  <span className="text-lg">🧾</span> الحاجات اللي هنحتاجها:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  {recipe.ingredients.map((ingredient, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="inline-block bg-primary text-white rounded-full w-5 h-5 flex-shrink-0 text-xs flex items-center justify-center mt-1">
                        {i+1}
                      </span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-md">
                <h4 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
                  <span className="text-lg">👩‍🍳</span> طريقة الشغل:
                </h4>
                <ol className="space-y-3 text-gray-600">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white bg-opacity-70 p-2 rounded-md shadow-sm">
                      <span className="inline-block bg-secondary text-white rounded-full w-6 h-6 flex-shrink-0 text-sm flex items-center justify-center mt-1 font-bold">
                        {i+1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 text-center">
                  <span className="inline-block animate-bounce text-xl">👌</span>
                </div>
              </div>
            </div>
            
            {recipe.videoId && (
              <div className="px-6 pb-6 mt-4">
                <h4 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
                  <span className="text-red-500">▶️</span> كمان ممكن تتفرج على الفيديو:
                </h4>
                <div className="rounded-lg overflow-hidden relative shadow-md" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${recipe.videoId}`}
                    title={recipe.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
