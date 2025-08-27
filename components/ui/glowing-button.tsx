// components/ui/glowing-button.tsx

import * as React from "react";
import { Button } from "@/components/ui/button";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

const GlowingButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      // The only change is adding padding `p-0.5` here
      <div className="relative inline-block rounded-md align-middle p-0.5">
        <GlowingEffect
          spread={8}
          blur={4}
          glow={true}
          disabled={false}
          proximity={16}
          inactiveZone={0.01}
          borderWidth={1.5}
        />
        <Button
          className={cn("relative z-10", className)}
          ref={ref}
          {...props}
        >
          {children}
        </Button>
      </div>
    );
  }
);

GlowingButton.displayName = "GlowingButton";

export { GlowingButton };