import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Heart,
  Users,
  Zap,
  Shield,
  Globe,
  Sparkles,
  ArrowRight,
  Star,
  Instagram,
  Twitter,
  Github,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/shared/logo";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Real-time Chat",
      description:
        "Instant messaging with real-time notifications and online status.",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Social Engagement",
      description:
        "Like, comment, and share posts with your friends and followers.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Building",
      description: "Connect with like-minded people and grow your network.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description:
        "Optimized performance with instant updates and smooth interactions.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description:
        "Your data is encrypted and protected with industry-standard security.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Reach",
      description:
        "Connect with people from around the world, anytime, anywhere.",
    },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      username: "@alexj",
      avatar: "https://i.pravatar.cc/150?img=1",
      content:
        "Best social platform I've ever used. The real-time features are incredible!",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      username: "@sarahc",
      avatar: "https://i.pravatar.cc/150?img=5",
      content:
        "Love how smooth and responsive everything is. The design is beautiful too.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      username: "@miker",
      avatar: "https://i.pravatar.cc/150?img=3",
      content:
        "Finally a platform that gets social media right. No clutter, just pure connection.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "1M+", label: "Active Users" },
    { value: "10M+", label: "Daily Posts" },
    { value: "50+", label: "Countries" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Navigation - Full width background, content constrained */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth/login")}
              className="hidden sm:inline-flex"
            >
              Log in
            </Button>
            <Button
              onClick={() => navigate("/auth/signup")}
              className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Welcome to the future of social connection
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Connect, Share, Thrive{" "}
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                in Real-Time
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg">
              Experience social media like never before. Instant updates,
              beautiful design, and meaningful connections.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth/signup")}
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg h-14 px-8"
              >
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth/login")}
                className="text-lg h-14 px-8"
              >
                Sign In
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image / Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl" />
            <Card className="relative overflow-hidden border-2 shadow-xl">
              <div className="p-4 bg-muted/30">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-linear-to-r from-blue-500 to-purple-500 h-48 rounded-lg" />
                  <div className="flex gap-4">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold">john_doe </span>
                    Loving this new platform! 🚀
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything you need in one place
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make your social experience seamless
            and enjoyable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section - Full width background, content constrained */}
      <section className="bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Loved by thousands
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the community of happy users who've made Socially Connected
              their home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.username}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-linear-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users already connecting, sharing, and thriving on
            Socially Connected.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth/signup")}
            className="bg-white text-blue-600 hover:bg-white/90 text-lg h-14 px-8"
          >
            Create your account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </section>

      {/* Footer - Full width background, content constrained */}
      <footer className="border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Logo />
              <p className="text-sm text-muted-foreground">
                Connect, share, and thrive in real-time with the next generation
                social platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Socially Connected. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
