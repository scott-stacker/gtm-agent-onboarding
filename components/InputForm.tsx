import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowUp as SendIcon } from "lucide-react";

interface InputFormProps {
  input: string;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function InputForm({
  input,
  isLoading,
  handleInputChange,
  handleSubmit,
}: InputFormProps) {
  return (
    <div className="px-0">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-gray-100 rounded-3xl p-2"
      >
        <div className="flex items-center">
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
              className="rounded-full w-8 h-8 p-0 m-0"
            >

                <SendIcon />

            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
