import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowUp as SendIcon, X as StopIcon } from "lucide-react";

interface InputFormProps {
  input: string;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  stop: () => void;
}

export function InputForm({
  input,
  isLoading,
  handleInputChange,
  handleSubmit,
  stop
}: InputFormProps) {
  return (
    <div className="px-0">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-gray-100 rounded-full p-2"
      >
        <div className="flex flex-col items-center sm:flex-row pl-2 space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            placeholder="Message Stacker Onboarding Assistant"
            value={input}
            onChange={handleInputChange}
            className="flex-grow rounded-lg border-none bg-transparent shadow-none"
          />
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full w-10 h-10 p-0 m-0"
            >
              {isLoading ? (
                <StopIcon />
              ) : (
                <SendIcon />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
