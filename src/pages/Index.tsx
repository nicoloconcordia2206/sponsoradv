import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-foreground">
      <div className="text-center p-8 max-w-3xl">
        <h1 className="text-5xl font-extrabold mb-6 text-primary">
          Welcome to ConnectHub
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Your multi-sector platform for professional and financial matchmaking.
          Connect with influencers, sponsor local initiatives, and find investors for your startup.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/creator-hub">Explore Creator Hub</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
            <Link to="/profile-wallet">Manage Your Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;