import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import beeLogo from "@/assets/bee-logo.png";

const LoginPage = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        if (!displayName.trim()) {
          toast({ title: "يرجى إدخال اسمك", variant: "destructive" });
          setLoading(false);
          return;
        }
        await register(username.trim(), password, displayName.trim());
        toast({ title: "تم إنشاء الحساب بنجاح 🎉" });
      } else {
        await login(username.trim(), password);
        toast({ title: "مرحباً بعودتك 🐝" });
      }
    } catch (err: any) {
      toast({ title: err.message || "حدث خطأ", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-honey flex items-center justify-center shadow-honey">
            <img src={beeLogo} alt="نحّالي" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">نحّالي</h1>
          <p className="text-muted-foreground mt-1">إدارة المناحل بذكاء</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-center">
            {isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label>الاسم الكامل</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="أحمد محمد"
                  maxLength={100}
                />
              </div>
            )}
            <div>
              <Label>اسم المستخدم</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ahmed123"
                dir="ltr"
                maxLength={50}
              />
            </div>
            <div>
              <Label>كلمة المرور</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                dir="ltr"
                maxLength={100}
              />
            </div>

            <Button type="submit" className="w-full gradient-honey text-primary-foreground" disabled={loading}>
              {loading ? "جاري..." : isRegister ? "إنشاء الحساب" : "دخول"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-primary hover:underline"
            >
              {isRegister ? "لديك حساب؟ سجّل دخولك" : "ليس لديك حساب؟ أنشئ واحداً"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          🔒 بياناتك محفوظة محلياً على جهازك — لا تحتاج إنترنت
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
