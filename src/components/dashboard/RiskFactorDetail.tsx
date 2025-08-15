
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface RiskFactorDetailProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  description: string;
  className?: string;
  africanContext: string;
  recommendations: string[];
}

const RiskFactorDetail: React.FC<RiskFactorDetailProps> = ({
  icon,
  title,
  value,
  unit,
  description,
  className,
  africanContext,
  recommendations
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card 
        className={`relative overflow-hidden transition-all cursor-pointer hover:scale-105 hover:shadow-lg ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-diabetesSense-accent mb-2">{icon}</div>
          <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="ml-1 text-sm text-gray-400">{unit}</span>}
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">{description}</p>
        </CardContent>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-diabetesSense-accent to-diabetesSense-accent/30"></div>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-diabetesSense-background border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <span className="text-diabetesSense-accent">{icon}</span>
              <span>{title}: <span className="text-diabetesSense-accent">{value} {unit}</span></span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-white mb-2">African Context</h4>
              <p className="text-gray-300 text-sm">{africanContext}</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-start">
                    <span className="text-diabetesSense-accent mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RiskFactorDetail;
