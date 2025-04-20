import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { queryClient, apiRequest } from "@/lib/queryClient"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookmarkX,
  ChefHat,
  Clock,
  Loader2,
  Search,
  SlidersHorizontal,
  Utensils
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SavedRecipe {
  id: number;
  userId: number;
  recipeData: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    videoId?: string;
    imageUrl?: string;
  };
  tags: string[] | any; // Allowing any due to potential JSON parsing issues
  createdAt: string;
}

export default function SavedRecipesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isArabic = language.startsWith('ar');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
  const [isViewRecipeOpen, setIsViewRecipeOpen] = useState(false);
  
  // إحضار الوصفات المحفوظة للمستخدم
  const {
    data: savedRecipes,
    isLoading,
    error
  } = useQuery({
    queryKey: ["/api/saved-recipes", user?.id],
    queryFn: () => {
      if (!user) return Promise.resolve([]);
      return fetch(`/api/users/${user.id}/saved-recipes`).then(res => res.json());
    },
    enabled: !!user,
  });
  
  // استخلاص جميع العلامات من الوصفات المحفوظة
  const allTags: string[] = savedRecipes 
    ? Array.from(new Set(savedRecipes.flatMap((recipe: SavedRecipe) => 
        Array.isArray(recipe.tags) ? recipe.tags as string[] : []
      )))
    : [];
    
  // تصفية الوصفات بناءً على كلمة البحث والعلامة المحددة
  const filteredRecipes = savedRecipes
    ? savedRecipes.filter((recipe: SavedRecipe) => {
        // تصفية بناءً على كلمة البحث
        const matchesSearch = searchQuery
          ? recipe.recipeData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.recipeData.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.recipeData.ingredients.some(ingredient => 
              ingredient.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : true;
          
        // تصفية بناءً على العلامة المحددة
        const matchesTag = selectedTag
          ? recipe.tags.includes(selectedTag)
          : true;
          
        return matchesSearch && matchesTag;
      })
    : [];
    
  // Mutation لحذف وصفة محفوظة
  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const res = await apiRequest("DELETE", `/api/users/${user?.id}/saved-recipes/${recipeId}`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: isArabic ? "تم حذف الوصفة" : "Recipe deleted",
        description: isArabic ? "تم حذف الوصفة من وصفاتك المحفوظة" : "Recipe removed from your saved recipes",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-recipes", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: isArabic ? "خطأ في الحذف" : "Error deleting recipe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // النصوص المترجمة حسب اللغة
  const texts = {
    title: isArabic ? "وصفاتي المحفوظة" : "My Saved Recipes",
    description: isArabic 
      ? "استعرض وصفاتك المفضلة التي حفظتها للرجوع إليها لاحقًا"
      : "Browse your favorite recipes that you've saved for later",
    noRecipes: isArabic 
      ? "لا توجد وصفات محفوظة حتى الآن" 
      : "No saved recipes yet",
    noRecipesDescription: isArabic
      ? "ابدأ بحفظ الوصفات من صفحة البحث حتى تظهر هنا"
      : "Start saving recipes from the search page to see them here",
    searchPlaceholder: isArabic 
      ? "ابحث في وصفاتك المحفوظة..." 
      : "Search your saved recipes...",
    filterByTag: isArabic ? "تصفية حسب العلامة" : "Filter by tag",
    allTags: isArabic ? "جميع العلامات" : "All tags",
    noResults: isArabic 
      ? "لا توجد نتائج مطابقة" 
      : "No matching results",
    clearFilters: isArabic ? "مسح التصفية" : "Clear filters",
    viewRecipe: isArabic ? "عرض الوصفة" : "View Recipe",
    deleteRecipe: isArabic ? "حذف الوصفة" : "Delete Recipe",
    confirmDelete: isArabic 
      ? "هل أنت متأكد من حذف هذه الوصفة؟" 
      : "Are you sure you want to delete this recipe?",
    ingredients: isArabic ? "المكونات" : "Ingredients",
    instructions: isArabic ? "طريقة التحضير" : "Instructions",
    watchVideo: isArabic ? "شاهد الفيديو" : "Watch Video",
    savedOn: isArabic ? "تم الحفظ في" : "Saved on",
    close: isArabic ? "إغلاق" : "Close",
    confirmDeleteBtn: isArabic ? "نعم، احذف" : "Yes, delete",
    cancelDeleteBtn: isArabic ? "إلغاء" : "Cancel",
  };
  
  // تحويل تاريخ الإنشاء إلى تنسيق مقروء
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  // عرض تفاصيل الوصفة عند النقر عليها
  const handleViewRecipe = (recipe: SavedRecipe) => {
    setSelectedRecipe(recipe);
    setIsViewRecipeOpen(true);
  };
  
  // حذف وصفة محفوظة
  const handleDeleteRecipe = (recipeId: number) => {
    if (window.confirm(texts.confirmDelete)) {
      deleteRecipeMutation.mutate(recipeId);
    }
  };
  
  // مسح خيارات التصفية
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
  };
  
  // التحقق مما إذا كان هناك تصفية نشطة
  const hasActiveFilters = searchQuery || selectedTag;
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {isArabic ? "جارٍ تحميل الوصفات المحفوظة..." : "Loading saved recipes..."}
        </p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <AlertTitle>{isArabic ? "خطأ في التحميل" : "Error Loading Data"}</AlertTitle>
          <AlertDescription>
            {isArabic 
              ? "حدث خطأ أثناء تحميل الوصفات المحفوظة. يرجى المحاولة مرة أخرى لاحقًا." 
              : "There was an error loading your saved recipes. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <Alert>
          <AlertTitle>{isArabic ? "يجب تسجيل الدخول" : "Login Required"}</AlertTitle>
          <AlertDescription>
            {isArabic 
              ? "يرجى تسجيل الدخول لعرض وصفاتك المحفوظة." 
              : "Please login to view your saved recipes."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (savedRecipes && savedRecipes.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-4 text-center">{texts.title}</h1>
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <BookmarkX className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{texts.noRecipes}</h2>
          <p className="text-muted-foreground mb-6">{texts.noRecipesDescription}</p>
          <Button onClick={() => window.location.href = "/"}>
            {isArabic ? "العودة إلى البحث عن وصفات" : "Back to Recipe Search"}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center md:text-start">{texts.title}</h1>
        <p className="text-muted-foreground mb-8 text-center md:text-start">{texts.description}</p>
        
        {/* أدوات البحث والتصفية */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={texts.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedTag || "all"} onValueChange={(value) => setSelectedTag(value === "all" ? null : value)}>
              <SelectTrigger className="w-[180px] flex-shrink-0">
                <SelectValue placeholder={texts.filterByTag} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{texts.allTags}</SelectItem>
                {allTags.map((tag: string) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="flex-shrink-0">
                {texts.clearFilters}
              </Button>
            )}
          </div>
        </div>
        
        {/* عرض الوصفات */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">{texts.noResults}</h2>
            <p className="text-muted-foreground mb-6">
              {isArabic 
                ? "لم يتم العثور على وصفات تطابق معايير البحث الخاصة بك" 
                : "No recipes found matching your search criteria"}
            </p>
            <Button onClick={clearFilters} variant="outline">
              {texts.clearFilters}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe: SavedRecipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg line-clamp-1">{recipe.recipeData.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                    >
                      <BookmarkX className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {recipe.recipeData.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recipe.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="bg-muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
                    <Clock className="h-3 w-3" />
                    <span>{texts.savedOn}: {formatDate(recipe.createdAt)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex items-center gap-1 font-medium">
                      <Utensils className="h-3 w-3" />
                      <span>{texts.ingredients}: {recipe.recipeData.ingredients.length}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    {texts.viewRecipe}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* نافذة عرض تفاصيل الوصفة */}
        <Dialog open={isViewRecipeOpen} onOpenChange={setIsViewRecipeOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedRecipe.recipeData.title}</DialogTitle>
                  <DialogDescription>
                    {selectedRecipe.recipeData.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  {selectedRecipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedRecipe.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="ingredients">
                      <AccordionTrigger className="bg-muted/50 px-4 rounded-lg hover:no-underline hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <ChefHat className="h-4 w-4" />
                          <span>{texts.ingredients}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-4">
                        <ul className="space-y-2">
                          {selectedRecipe.recipeData.ingredients.map((ingredient, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="inline-block bg-primary text-white rounded-full w-5 h-5 flex-shrink-0 text-xs flex items-center justify-center mt-1">
                                {index + 1}
                              </span>
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="instructions" className="mt-2">
                      <AccordionTrigger className="bg-muted/50 px-4 rounded-lg hover:no-underline hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          <span>{texts.instructions}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-4">
                        <ol className="space-y-3">
                          {selectedRecipe.recipeData.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="inline-block bg-secondary text-white rounded-full w-6 h-6 flex-shrink-0 text-sm flex items-center justify-center mt-1 font-bold">
                                {index + 1}
                              </span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  {/* فيديو تعليمي إذا كان متوفر */}
                  {selectedRecipe.recipeData.videoId && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-red-500">▶️</span> 
                        {texts.watchVideo}
                      </h3>
                      <div className="rounded-lg overflow-hidden relative shadow-md" style={{ paddingBottom: '56.25%', height: 0 }}>
                        <iframe 
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${selectedRecipe.recipeData.videoId}`}
                          title={selectedRecipe.recipeData.title}
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteRecipe(selectedRecipe.id);
                      setIsViewRecipeOpen(false);
                    }}
                  >
                    <BookmarkX className="mr-2 h-4 w-4" />
                    {texts.deleteRecipe}
                  </Button>
                  
                  <Button onClick={() => setIsViewRecipeOpen(false)}>
                    {texts.close}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}