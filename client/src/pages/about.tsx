
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Github, Mail, Star, Coffee } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About SwapShikshak</h1>
          <p className="text-lg text-gray-600">
            Building bridges between teachers and their dreams
          </p>
        </div>

        {/* Main About Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🧑‍🏫</span>
              About SwapShikshak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              SwapShikshak is a platform built with a simple aim — to help government school teachers in India find mutual transfers more easily, quickly, and fairly.
            </p>
            <p className="text-gray-700 leading-relaxed">
              I created this project after seeing how many teachers are posted far from their hometowns, often struggling to return to their families. While mutual transfers are allowed, there's no central platform to help find the right match.
            </p>
            <p className="text-gray-700 leading-relaxed font-medium">
              So, I built one — for you.
            </p>
          </CardContent>
        </Card>

        {/* Creator Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👨‍💻</span>
              A Gift from Me, Vishwas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Hi! I'm Vishwas Soni, a college student and developer passionate about creating practical solutions for real-life problems.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                SwapShikshak is not a government project or a commercial product. It's a personal initiative, a gift for all teachers who give their everything to educate others.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              Support My Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              If you found this platform helpful and want to support me in continuing this or other socially impactful projects, you can:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Coffee className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">💸 UPI / Donation</h4>
                <p className="text-sm text-gray-600 font-mono">vishwaszsoni@okhdfcbank</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Github className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">⭐ Star on GitHub</h4>
                <a 
                  href="https://github.com/vish-dumps/SwapShikshak" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  GitHub Repository
                </a>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <Heart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">🧠 Share with Others</h4>
                <p className="text-sm text-gray-600">This helps more than anything!</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-gray-700 italic">
                Your encouragement keeps me building, learning, and giving back. 🙏
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Feedback & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Feel free to reach out for feedback, ideas, or even just a hello:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:vishwaszsoni@gmail.com"
                className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">vishwaszsoni@gmail.com</span>
              </a>
              
              <a 
                href="https://github.com/vish-dumps"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Github className="h-5 w-5 text-gray-600" />
                <span className="text-gray-800">@vish-dumps</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
