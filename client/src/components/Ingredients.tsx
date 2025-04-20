import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ingredient } from "@/lib/types";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IngredientsProps {
  ingredients: Ingredient[];
  onAddIngredient: (name: string) => void;
  onRemoveIngredient: (id: string) => void;
  onClearIngredients: () => void;
  onSearchRecipes: () => void;
}

export default function Ingredients({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onClearIngredients,
  onSearchRecipes,
}: IngredientsProps) {
  const [ingredientInput, setIngredientInput] = useState("");

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      onAddIngredient(ingredientInput);
      setIngredientInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddIngredient();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <span className="animate-pulse">🛒</span> 
        أكتب المكونات اللي عندك في البيت 
      </h2>
      
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="flex-grow">
          <Input
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="زي البصل، التوم، الطماطم..."
            className="w-full px-4 py-2 text-right shadow-inner transition-all duration-300 focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button 
          onClick={handleAddIngredient} 
          className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300"
        >
          <span className="ml-1">✨</span> حطّه في السلة
        </Button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <span>🥗</span> الحاجات اللي اخترتها:
        </h3>
        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-dashed border-gray-300 rounded-md">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="bg-gradient-to-r from-primary-light to-primary-light/60 px-3 py-1 rounded-full text-gray-800 flex items-center text-sm shadow-sm hover:shadow-md transition-all duration-300"
            >
              {ingredient.name}
              <button
                onClick={() => onRemoveIngredient(ingredient.id)}
                className="mr-1 text-gray-800 hover:text-red-500 font-bold"
                aria-label="إزالة المكون"
              >
                ×
              </button>
            </div>
          ))}
          {ingredients.length === 0 && (
            <span className="text-gray-400 text-sm py-1 px-2">لسه مختارتش حاجات...</span>
          )}
        </div>
      </div>
      
      {ingredients.length === 0 && (
        <Alert className="mb-4 bg-yellow-50 border border-yellow-500 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            محتاجين تدخل المكونات الأول عشان نقدر نطلعلك أكلات حلوة
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-2 justify-center md:justify-start">
        <Button
          onClick={onSearchRecipes}
          className="px-6 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          disabled={ingredients.length === 0}
        >
          <span className="ml-1">🍳</span> اطبخلي حاجة
        </Button>
        <Button
          onClick={onClearIngredients}
          variant="outline"
          className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg transition-all duration-300"
        >
          <span className="ml-1">🧹</span> امسح الكل
        </Button>
      </div>
    </div>
  );
}
