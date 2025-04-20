import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Mail, AlertTriangle, CheckCircle, Flag, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ContactModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("bug");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // إرسال البيانات إلى API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject: getSubjectText(subject),
          message
        }),
      });
      
      // التحقق من استجابة الخادم
      const data = await response.json();
      console.log("استجابة الخادم:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'حدث خطأ أثناء إرسال النموذج');
      }
      
      // عرض معلومات في وحدة التحكم للتأكد من نجاح الإرسال
      console.log("تم إرسال نموذج الاتصال بنجاح:", {
        status: response.status,
        response: data
      });
      
      toast({
        title: "تم إرسال رسالتك بنجاح!",
        description: "شكراً على تواصلك معنا، سنرد عليك في أقرب وقت ممكن عبر البريد الإلكتروني.",
        variant: "default",
      });
      
      // إعادة تعيين النموذج وإغلاق النافذة
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("خطأ في إرسال نموذج الاتصال:", error);
      toast({
        title: "حدث خطأ أثناء الإرسال",
        description: "يرجى المحاولة مرة أخرى لاحقاً أو التواصل معنا مباشرة على quickrecipe2026@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("bug");
    setMessage("");
  };

  const getSubjectText = (key: string): string => {
    switch (key) {
      case "bug": return "إبلاغ عن خطأ";
      case "feature": return "اقتراح ميزة";
      case "feedback": return "رأي وتقييم";
      case "question": return "سؤال";
      default: return "تواصل";
    }
  };

  const getSubjectIcon = (key: string) => {
    switch (key) {
      case "bug": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "feature": return <Flag className="h-5 w-5 text-green-500" />;
      case "feedback": return <CheckCircle className="h-5 w-5 text-primary" />;
      case "question": return <InfoIcon className="h-5 w-5 text-blue-500" />;
      default: return <Mail className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-gray-400 hover:text-white transition-colors">
          <Mail className="h-4 w-4 mr-1" />
          تواصل معنا
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5" />
            تواصل معنا
          </DialogTitle>
          <DialogDescription>
            يمكنك الإبلاغ عن مشكلة، أو اقتراح ميزة جديدة، أو إرسال تقييمك لموقعنا
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك هنا" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">نوع الرسالة</Label>
            <Select 
              value={subject} 
              onValueChange={setSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الرسالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>إبلاغ عن خطأ</span>
                  </div>
                </SelectItem>
                <SelectItem value="feature">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-green-500" />
                    <span>اقتراح ميزة</span>
                  </div>
                </SelectItem>
                <SelectItem value="feedback">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>رأي وتقييم</span>
                  </div>
                </SelectItem>
                <SelectItem value="question">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-4 w-4 text-blue-500" />
                    <span>سؤال</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">الرسالة</Label>
            <Textarea 
              id="message" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..." 
              className="h-32" 
              required 
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="mt-4 sm:mt-0"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-4 sm:mt-0 gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 ml-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  إرسال
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ContactModal;