import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, Share, Award, PlusCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// نوع البيانات القادمة من قاعدة البيانات
type DbPost = {
  id: number;
  userId: number;
  title: string;
  content: string;
  postType: string;
  imageUrl?: string;
  tags: string[] | string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  userName?: string;
  userLevel?: string;
  userAvatar?: string;
};

// نمط البوست المستخدم في واجهة المستخدم
type Post = {
  id: number;
  user: {
    name: string;
    level: string;
    avatar: string;
    initials: string;
    id?: number; // إضافة معرف المستخدم للتحقق من صلاحية الحذف
  };
  title: string;
  content: string;
  postType: string;
  image?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  date: string;
  isOwnPost?: boolean; // إضافة حقل للتحقق مما إذا كان المنشور ملكًا للمستخدم الحالي
};

// تحويل بيانات قاعدة البيانات إلى نموذج Post
const mapDbPostToUiPost = (dbPost: DbPost, isArabic: boolean, currentUserId?: string): Post => {
  // استخراج الاسم الأول والحرف الأول من الاسم الأخير إن وجد
  const userName = dbPost.userName || (isArabic ? "مستخدم" : "User");
  const nameParts = userName.split(' ');
  const initials = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[1][0]}` 
    : userName.substring(0, 2);

  // معالجة تاريخ الإنشاء
  const createdAt = new Date(dbPost.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  let dateDisplay = '';
  if (diffMins < 60) {
    dateDisplay = isArabic 
      ? `منذ ${diffMins} دقيقة` 
      : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    dateDisplay = isArabic 
      ? `منذ ${diffHours} ساعة` 
      : `${diffHours} hours ago`;
  } else {
    dateDisplay = isArabic 
      ? `منذ ${diffDays} يوم` 
      : `${diffDays} days ago`;
  }
  
  if (diffMins < 5) {
    dateDisplay = isArabic ? "الآن" : "Just now";
  }

  // صورة ضيف فيسبوك للمستخدمين بدون صورة
  const guestAvatarUrl = "https://static.xx.fbcdn.net/rsrc.php/v1/yi/r/odA9sNLrE86.jpg";
  
  return {
    id: dbPost.id,
    user: {
      id: dbPost.userId, // إضافة معرف المستخدم
      name: userName,
      level: dbPost.userLevel || (isArabic ? "طاهي متحمس" : "Cooking Enthusiast"),
      // استخدام صورة ضيف الفيسبوك إذا لم تكن هناك صورة
      avatar: dbPost.userAvatar || guestAvatarUrl,
      initials: initials
    },
    title: dbPost.title,
    content: dbPost.content,
    postType: dbPost.postType,
    image: dbPost.imageUrl,
    tags: Array.isArray(dbPost.tags) ? dbPost.tags : (typeof dbPost.tags === 'string' ? JSON.parse(dbPost.tags) : []),
    likes: dbPost.likesCount,
    comments: dbPost.commentsCount,
    shares: dbPost.sharesCount,
    date: dateDisplay,
    isOwnPost: currentUserId ? String(dbPost.userId) === currentUserId : false // إضافة علامة إذا كان المنشور ملكًا للمستخدم الحالي
  };
};

// بيانات نموذجية للمنشورات
const SAMPLE_POSTS: Post[] = [
  {
    id: 1,
    user: {
      name: "سارة أحمد",
      level: "طاهي متقدم",
      avatar: "https://i.pravatar.cc/150?img=23",
      initials: "سأ"
    },
    title: "طريقة عمل كيكة الشوكولاتة بالصوص السائل",
    content: "اليوم شاركت في تحدي الحلويات وأحببت أن أشارككم وصفتي المفضلة لكيكة الشوكولاتة بالصوص السائل...",
    postType: "recipe",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    tags: ["حلويات", "شوكولاتة", "تحدي الأسبوع"],
    likes: 42,
    comments: 7,
    shares: 3,
    date: "منذ 3 ساعات"
  },
  {
    id: 2,
    user: {
      name: "محمد علي",
      level: "طاهي محترف",
      avatar: "https://i.pravatar.cc/150?img=12",
      initials: "مع"
    },
    title: "وجبة إيطالية خفيفة: سباغيتي بصوص البيستو محلي الصنع",
    content: "اليوم أشارككم وصفتي لسباغيتي البيستو بمكونات بسيطة متوفرة في كل مطبخ. الوصفة سهلة وسريعة...",
    postType: "recipe",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    tags: ["مكرونة", "إيطالي", "نباتي"],
    likes: 36,
    comments: 12,
    shares: 5,
    date: "منذ يومين"
  },
  {
    id: 3,
    user: {
      name: "نورا محمود",
      level: "هاوي طبخ",
      avatar: "https://i.pravatar.cc/150?img=29",
      initials: "نم"
    },
    title: "أول تجربة مع خبز التنور - شاركوني رأيكم!",
    content: "بعد عدة محاولات أخيرًا نجحت في صنع خبز التنور في المنزل. استخدمت دقيق القمح الكامل واتبعت خطوات ووقت التخمير بدقة...",
    postType: "experience",
    image: "https://images.unsplash.com/photo-1586765501019-cbe3294228fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    tags: ["خبز", "مخبوزات", "تجارب"],
    likes: 28,
    comments: 15,
    shares: 2,
    date: "منذ 4 أيام"
  }
];

// بيانات نموذجية للمنشورات باللغة الإنجليزية
const SAMPLE_POSTS_EN: Post[] = [
  {
    id: 1,
    user: {
      name: "Sarah Ahmed",
      level: "Advanced Chef",
      avatar: "https://i.pravatar.cc/150?img=23",
      initials: "SA"
    },
    title: "How to Make Chocolate Lava Cake",
    content: "Today I participated in the dessert challenge and wanted to share my favorite recipe for chocolate lava cake...",
    postType: "recipe",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    tags: ["Desserts", "Chocolate", "Weekly Challenge"],
    likes: 42,
    comments: 7,
    shares: 3,
    date: "3 hours ago"
  },
  {
    id: 2,
    user: {
      name: "Mohammed Ali",
      level: "Professional Chef",
      avatar: "https://i.pravatar.cc/150?img=12",
      initials: "MA"
    },
    title: "Light Italian Meal: Spaghetti with Homemade Pesto",
    content: "Today I'm sharing my recipe for pesto spaghetti with simple ingredients available in every kitchen. The recipe is easy and quick...",
    postType: "recipe",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    tags: ["Pasta", "Italian", "Vegetarian"],
    likes: 36,
    comments: 12,
    shares: 5,
    date: "2 days ago"
  },
  {
    id: 3,
    user: {
      name: "Nora Mahmoud",
      level: "Cooking Enthusiast",
      avatar: "https://i.pravatar.cc/150?img=29",
      initials: "NM"
    },
    title: "First Attempt at Tandoor Bread - Share Your Thoughts!",
    content: "After several attempts, I finally succeeded in making tandoor bread at home. I used whole wheat flour and followed the fermentation steps and timing precisely...",
    postType: "experience",
    image: "https://images.unsplash.com/photo-1586765501019-cbe3294228fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    tags: ["Bread", "Baking", "Experiments"],
    likes: 28,
    comments: 15,
    shares: 2,
    date: "4 days ago"
  }
];

export default function CommunityPostsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const isArabic = language.startsWith('ar');
  
  // استعلامات لجلب البيانات من الخادم
  const { data: trendingPostsData, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/community-posts/trending"],
  });

  const { data: recentPostsData, isLoading: recentLoading } = useQuery({
    queryKey: ["/api/community-posts/recent"],
  });

  // تخزين حالة البيانات
  const [trendingPosts, setTrendingPosts] = useState<Post[]>(isArabic ? SAMPLE_POSTS : SAMPLE_POSTS_EN);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [challengePosts, setChallengePosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState("trending");
  
  // للتبديل بين تبويبات المحتوى
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>(1); // المستخدم الافتراضي 
  
  // حالة عرض قائمة التبويبات على الهاتف
  const [mobileTabsMenuOpen, setMobileTabsMenuOpen] = useState(false);
  
  // معلومات المستخدم من حساب Google (اسم المستخدم وصورته)
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  
  // الاستماع لحدث تغيير التبويب من مكون MobileMenuButton
  useEffect(() => {
    const handleCommunityTabChange = (event: CustomEvent) => {
      if (event.detail && event.detail.tab) {
        setActiveTab(event.detail.tab);
      }
    };
    
    // إضافة مستمع الحدث
    document.addEventListener('communityTabChange', handleCommunityTabChange as EventListener);
    
    // إزالة مستمع الحدث عند تفكيك المكون
    return () => {
      document.removeEventListener('communityTabChange', handleCommunityTabChange as EventListener);
    };
  }, []);
  
  // mutate لإنشاء منشور جديد
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      userId: number;
      title: string;
      content: string;
      postType: string;
      tags: string[];
      imageUrl?: string;
    }) => {
      const res = await apiRequest("POST", "/api/community-posts", postData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: isArabic ? "تم إنشاء المنشور بنجاح" : "Post created successfully",
        description: isArabic ? "تم نشر منشورك في مجتمع الطهاة" : "Your post has been published to the chef community",
        variant: "default",
      });
      
      // إعادة تحميل البيانات
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts/trending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts/recent"] });
      
      // إعادة تعيين النموذج
      setPostTitle("");
      setPostContent("");
      setPostTags("");
      setSelectedFile(null);
      setNewPostOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: isArabic ? "فشل إنشاء المنشور" : "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // للمحافظة على قائمة المنشورات التي أبدى المستخدم إعجابه بها
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // mutate للإعجاب بمنشور
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/community-posts/${postId}/like`, {});
      return await res.json();
    },
    onSuccess: (data, postId) => {
      // إضافة هذا المنشور إلى قائمة المنشورات المعجب بها
      setLikedPosts(prev => [...prev, postId]);
      
      // حفظ المعلومات في التخزين المحلي
      const storedLikes = localStorage.getItem('likedPosts');
      const likedPostsArray = storedLikes ? JSON.parse(storedLikes) : [];
      likedPostsArray.push(postId);
      localStorage.setItem('likedPosts', JSON.stringify(likedPostsArray));
      
      // إعادة تحميل البيانات
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts/trending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts/recent"] });
    },
    onError: (error: Error) => {
      toast({
        title: isArabic ? "فشل تسجيل الإعجاب" : "Failed to like post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // تحميل قائمة المنشورات المعجب بها عند بدء التطبيق
  useEffect(() => {
    const storedLikes = localStorage.getItem('likedPosts');
    if (storedLikes) {
      setLikedPosts(JSON.parse(storedLikes));
    }
  }, []);
  
  // mutate لحذف منشور
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/community-posts/${postId}`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: isArabic ? "تم حذف المنشور" : "Post deleted",
        description: isArabic ? "تم حذف المنشور بنجاح" : "Your post has been deleted successfully",
        variant: "default",
      });
      
      // إعادة تحميل البيانات
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts/trending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts/recent"] });
    },
    onError: (error: Error) => {
      toast({
        title: isArabic ? "فشل حذف المنشور" : "Failed to delete post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // النصوص المترجمة
  const texts = {
    title: isArabic ? "منشورات مجتمع الطهاة" : "Chef Community Posts",
    trending: isArabic ? "الرائج" : "Trending",
    recent: isArabic ? "الأحدث" : "Recent",
    following: isArabic ? "المتابَعون" : "Following", 
    challenges: isArabic ? "التحديات" : "Challenges",
    like: isArabic ? "إعجاب" : "Like",
    comment: isArabic ? "تعليق" : "Comment",
    share: isArabic ? "مشاركة" : "Share",
    createPost: isArabic ? "إنشاء منشور جديد" : "Create New Post",
    uploadImage: isArabic ? "رفع صورة" : "Upload Image",
    cancel: isArabic ? "إلغاء" : "Cancel",
    post: isArabic ? "نشر" : "Post",
    postTitle: isArabic ? "عنوان المنشور" : "Post Title",
    postContent: isArabic ? "محتوى المنشور" : "Post Content",
    postTags: isArabic ? "الوسوم (افصل بين الوسوم بفواصل)" : "Tags (separate with commas)",
    photoLabel: isArabic ? "إضافة صورة" : "Add Photo"
  };
  
  // جلب معلومات المستخدم من حساب Google
  useEffect(() => {
    if (user) {
      setUserName(user.displayName || "");
      setUserAvatar(user.photoURL || "");
    }
  }, [user]);

  // تحميل المنشورات من الخادم
  useEffect(() => {
    if (trendingPostsData) {
      const userId = user?.id || 0;
      const mappedPosts = (trendingPostsData as DbPost[]).map(post => 
        mapDbPostToUiPost(post, isArabic, userId.toString())
      );
      setTrendingPosts(mappedPosts.length > 0 ? mappedPosts : (isArabic ? SAMPLE_POSTS : SAMPLE_POSTS_EN));
    }
  }, [trendingPostsData, isArabic, user]);

  // تحميل المنشورات الأخيرة من الخادم
  useEffect(() => {
    if (recentPostsData) {
      const userId = user?.id || 0;
      const mappedPosts = (recentPostsData as DbPost[]).map(post => 
        mapDbPostToUiPost(post, isArabic, userId.toString())
      );
      setRecentPosts(mappedPosts);
    }
  }, [recentPostsData, isArabic, user]);
  
  // وظيفة لمعالجة إنشاء منشور جديد
  const handleCreatePost = () => {
    // التحقق من وجود العنوان والمحتوى
    if (!postTitle.trim() || !postContent.trim()) {
      return;
    }
    
    // تجهيز الوسوم
    const tagsList = postTags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);
    
    if (tagsList.length === 0) {
      tagsList.push(isArabic ? "وصفة" : "recipe");
    }
    
    // إنشاء كائن المنشور الجديد لإرساله إلى الخادم
    const postData = {
      userId: currentUserId,
      title: postTitle,
      content: postContent,
      postType: "recipe", // النوع الافتراضي هو وصفة
      tags: tagsList, // إرسال المصفوفة مباشرة بدلاً من تحويلها إلى نص
      imageUrl: "", // سنحتاج إلى رفع الصورة إلى خدمة تخزين سحابية في التطبيق الكامل
      userName: userName || (isArabic ? "مستخدم" : "User"),
      userAvatar: userAvatar || "https://i.pravatar.cc/150?img=33",
    };
    
    // إرسال المنشور الجديد إلى الخادم
    createPostMutation.mutate(postData);
    
    // تحويل المستخدم إلى تبويب "الأحدث" لرؤية منشوره بعد إعادة التحميل
    setActiveTab("recent");
  };
  
  // وظيفة لمعالجة تحميل الملفات
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  // وظيفة لعرض بطاقة منشور
  const renderPostCard = (post: Post) => (
    <Card key={post.id} className="overflow-hidden max-w-3xl mx-auto shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-gray-100">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="flex items-center text-lg font-bold">
              {post.user.name}
              {post.user.level === "طاهي محترف" || post.user.level === "Professional Chef" ? (
                <Award className="h-4 w-4 text-amber-500 ml-2" />
              ) : null}
            </CardTitle>
            <CardDescription className="flex items-center text-sm">
              <span>{post.user.level}</span>
              <span className="mx-2">•</span>
              <span>{post.date}</span>
            </CardDescription>
          </div>
        </div>
        
        {/* زر حذف المنشور - يظهر فقط إذا كان المنشور للمستخدم الحالي */}
        {post.isOwnPost && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={() => {
              if (window.confirm(isArabic ? "هل أنت متأكد من حذف هذا المنشور؟" : "Are you sure you want to delete this post?")) {
                deletePostMutation.mutate(post.id);
              }
            }}
            disabled={deletePostMutation.isPending}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            {deletePostMutation.isPending && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-6 pt-4">
        <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
        <p className="mb-4 text-gray-700">{post.content}</p>
        {post.image && (
          <div className="rounded-md overflow-hidden mb-4 max-h-[400px] w-full border border-gray-100">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="bg-zinc-100 hover:bg-zinc-200 transition-colors duration-200">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="border-t px-6 py-3 bg-muted/20">
        <div className="flex gap-4 w-full justify-center md:justify-start">
          <Button 
            variant={likedPosts.includes(post.id) ? "default" : "ghost"}
            size="sm" 
            className={`flex items-center ${
              likedPosts.includes(post.id) 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'text-zinc-600 hover:text-green-600 hover:bg-green-50'
            } transition-colors duration-200`}
            onClick={() => {
              // منع التكرار إذا كان المستخدم قد سجل إعجابه بالفعل
              if (!likedPosts.includes(post.id)) {
                likePostMutation.mutate(post.id);
                toast({
                  title: isArabic ? "أعجبني" : "Liked!",
                  description: isArabic ? "تم تسجيل إعجابك بهذا المنشور" : "Your like has been registered",
                  variant: "default",
                });
              }
            }}
            disabled={likePostMutation.isPending || likedPosts.includes(post.id)}
          >
            <ThumbsUp className={`h-4 w-4 mr-1 ${likedPosts.includes(post.id) ? 'fill-white' : ''}`} />
            <span className="font-semibold">{post.likes}</span>
            <span className="hidden sm:inline ml-1">{texts.like}</span>
            {likePostMutation.isPending && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-zinc-600 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
            onClick={() => {
              // استخدام واجهة المشاركة المدمجة في المتصفح إذا كانت متوفرة
              if (navigator.share) {
                navigator.share({
                  title: post.title,
                  text: post.content.substring(0, 100) + '...',
                  url: window.location.href
                }).catch((error) => console.log('Error sharing', error));
              } else {
                // نسخ الرابط 
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: isArabic ? "تمت نسخ الرابط" : "Link copied",
                  description: isArabic ? "تم نسخ رابط المنشور إلى الحافظة" : "Post link copied to clipboard",
                });
              }
            }}
          >
            <Share className="h-4 w-4 mr-1" />
            <span>{post.shares}</span>
            <span className="hidden sm:inline ml-1">{texts.share}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-center md:text-right">{texts.title}</h1>
        
        <Button 
          onClick={() => setNewPostOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
          size="sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {texts.createPost}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* سيستخدم زر القائمة العمومي بدلاً من هذا - ولا توجد حاجة لوجود قائمة منسدلة هنا */}
        
        {/* نسخة الشاشات الكبيرة */}
        <div className="hidden md:flex justify-center w-full mb-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger 
              value="trending" 
              className="text-sm"
            >
              {texts.trending}
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              className="text-sm"
            >
              {texts.recent}
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="text-sm"
            >
              {texts.following}
            </TabsTrigger>
            <TabsTrigger 
              value="challenges" 
              className="text-sm"
            >
              {texts.challenges}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="trending" className="space-y-6">
          {trendingLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trendingPosts.length > 0 ? (
            trendingPosts.map(post => renderPostCard(post))
          ) : (
            <div className="text-center py-12">
              {isArabic 
                ? "لا توجد منشورات رائجة متاحة حاليًا."
                : "No trending posts available at the moment."}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-6">
          {recentLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentPosts.length > 0 ? (
            recentPosts.map(post => renderPostCard(post))
          ) : (
            <div className="text-center py-12">
              {isArabic 
                ? "لا توجد منشورات حديثة بعد. كن أول من ينشر!"
                : "No recent posts yet. Be the first to post!"}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="following" className="space-y-6">
          {followingPosts.length > 0 ? (
            followingPosts.map(post => renderPostCard(post))
          ) : (
            <div className="text-center py-12">
              {isArabic 
                ? "ستظهر منشورات الطهاة الذين تتابعهم هنا. تابع بعض الطهاة أو قم بإنشاء منشور!"
                : "Posts from chefs you follow will appear here. Follow some chefs or create a post!"}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="challenges" className="space-y-6">
          {challengePosts.length > 0 ? (
            challengePosts.map(post => renderPostCard(post))
          ) : (
            <div className="text-center py-12">
              {isArabic 
                ? "ستظهر منشورات تحديات الطبخ الأسبوعية هنا. شارك في التحديات أو قم بإنشاء منشور!"
                : "Weekly cooking challenge posts will appear here. Join challenges or create a post!"}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* نافذة حوار إنشاء منشور جديد */}
      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
        <DialogContent className="sm:max-w-[550px] p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="text-2xl font-bold text-green-600">{texts.createPost}</DialogTitle>
            <DialogDescription className="mt-2">
              {isArabic 
                ? "شارك وصفاتك المفضلة أو تجاربك في الطبخ مع مجتمع الطهاة"
                : "Share your favorite recipes or cooking experiments with the chef community"}
            </DialogDescription>
          </DialogHeader>
          
          <form 
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreatePost();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="post-title" className="text-sm font-medium">{texts.postTitle}</Label>
              <Input 
                id="post-title" 
                value={postTitle} 
                onChange={(e) => setPostTitle(e.target.value)} 
                className="focus-visible:ring-green-500 transition-shadow w-full"
                placeholder={isArabic ? "عنوان الوصفة أو المنشور..." : "Recipe or post title..."}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="post-content" className="text-sm font-medium">{texts.postContent}</Label>
              <Textarea 
                id="post-content" 
                rows={5} 
                value={postContent} 
                onChange={(e) => setPostContent(e.target.value)} 
                className="focus-visible:ring-green-500 transition-shadow resize-none w-full"
                placeholder={isArabic ? "شارك تفاصيل وصفتك أو تجربتك في الطبخ..." : "Share details about your recipe or cooking experience..."}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="post-tags" className="text-sm font-medium">{texts.postTags}</Label>
              <Input 
                id="post-tags" 
                placeholder={isArabic ? "حلويات، وصفات سريعة..." : "desserts, quick recipes..."}
                value={postTags} 
                onChange={(e) => setPostTags(e.target.value)} 
                className="focus-visible:ring-green-500 transition-shadow w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="post-photo" className="text-sm font-medium">{texts.photoLabel}</Label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-md p-6 transition-colors hover:border-green-400">
                <label htmlFor="post-photo" className="block cursor-pointer">
                  <div className="text-center">
                    <PlusCircle className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {isArabic ? "انقر لاختيار صورة أو اسحبها هنا" : "Click to select an image or drag it here"}
                    </p>
                  </div>
                  <Input 
                    id="post-photo" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="sr-only"
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="text-sm text-green-600 mt-2 flex items-center">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                    {isArabic ? "تم اختيار: " : "Selected: "} 
                    {selectedFile.name}
                  </span>
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-6 gap-3 flex-col sm:flex-row-reverse pt-4 border-t">
              <Button 
                type="submit"
                disabled={!postTitle.trim() || !postContent.trim()}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto transition-colors"
              >
                {texts.post}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setNewPostOpen(false)} 
                className="w-full sm:w-auto border-gray-300"
              >
                {texts.cancel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}