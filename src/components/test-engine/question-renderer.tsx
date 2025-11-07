"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type Props = {
  question: {
    id: string;
    text: string;
    type: "MCQ" | "TRUE_FALSE" | "NUMERICAL" | "FILL_BLANK";
    imageUrl?: string;
    options?: Array<{ id: string; text: string; imageUrl?: string }>;
  };
  value: unknown;
  onChange: (value: unknown) => void;
};

export function QuestionRenderer({ question, value, onChange }: Props) {
  if (question.type === "MCQ") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Multiple Choice
              </Badge>
              {value !== undefined && value !== null && value !== "" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Answered
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold leading-relaxed">
              {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {question.imageUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6 relative w-full h-60 sm:h-80 border-2 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-inner cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Image
                  src={question.imageUrl}
                  alt="Question"
                  fill
                  sizes="(max-width: 640px) 100vw, 800px"
                  style={{ objectFit: "contain" }}
                  className="p-2"
                  onClick={() =>
                    window.open(question.imageUrl as string, "_blank")
                  }
                />
              </motion.div>
            ) : null}
            <RadioGroup
              value={(value as string) ?? ""}
              onValueChange={(v) => onChange(v)}
              className="space-y-3"
            >
              {question.options?.map((opt, idx) => {
                const isSelected = value === opt.id;
                return (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    whileHover={{ x: 4 }}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-md"
                        : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onClick={() => onChange(opt.id)}
                  >
                    <RadioGroupItem
                      id={`${question.id}-${opt.id}`}
                      value={opt.id}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`${question.id}-${opt.id}`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {opt.text}
                      </Label>
                      {opt.imageUrl ? (
                        <div className="mt-3 relative w-full h-40 border rounded-lg overflow-hidden bg-black/5 hover:border-primary/50 transition-colors">
                          <Image
                            src={opt.imageUrl}
                            alt="Option"
                            fill
                            sizes="(max-width: 640px) 100vw, 600px"
                            style={{ objectFit: "contain" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(opt.imageUrl as string, "_blank");
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-primary"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (question.type === "TRUE_FALSE") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                True/False
              </Badge>
              {value !== undefined && value !== null && value !== "" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Answered
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold leading-relaxed">
              {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {question.imageUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6 relative w-full h-60 sm:h-80 border-2 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-inner cursor-pointer hover:border-primary/50 transition-colors"
              >
                <img
                  src={question.imageUrl}
                  alt="Question"
                  className="w-full h-full object-contain p-2"
                  onClick={() =>
                    window.open(question.imageUrl as string, "_blank")
                  }
                />
              </motion.div>
            ) : null}
            <RadioGroup
              value={(value as string) ?? ""}
              onValueChange={(v) => onChange(v)}
              className="space-y-3"
            >
              {[
                { id: "TRUE", text: "True", color: "green" },
                { id: "FALSE", text: "False", color: "red" },
              ].map((opt, idx) => {
                const isSelected = value === opt.id;
                return (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    whileHover={{ x: 4, scale: 1.02 }}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? opt.color === "green"
                          ? "bg-green-50 dark:bg-green-900/20 border-green-500 shadow-md"
                          : "bg-red-50 dark:bg-red-900/20 border-red-500 shadow-md"
                        : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onClick={() => onChange(opt.id)}
                  >
                    <RadioGroupItem
                      id={`${question.id}-${opt.id}`}
                      value={opt.id}
                    />
                    <Label
                      htmlFor={`${question.id}-${opt.id}`}
                      className="text-lg font-semibold cursor-pointer flex-1"
                    >
                      {opt.text}
                    </Label>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`${
                          opt.color === "green"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Numerical and Fill in the blank
  if (question.type === "NUMERICAL" || question.type === "FILL_BLANK") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {question.type === "NUMERICAL"
                  ? "Numerical"
                  : "Fill in the Blank"}
              </Badge>
              {value !== undefined && value !== null && value !== "" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Answered
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold leading-relaxed">
              {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {question.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6 relative w-full h-60 sm:h-80 border-2 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-inner"
              >
                <img
                  src={question.imageUrl}
                  alt="Question"
                  className="w-full h-full object-contain p-2"
                />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label
                htmlFor={`${question.id}-answer`}
                className="text-sm font-medium"
              >
                Your Answer:
              </Label>
              <input
                id={`${question.id}-answer`}
                type={question.type === "NUMERICAL" ? "number" : "text"}
                value={(value as string) ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={
                  question.type === "NUMERICAL"
                    ? "Enter a number"
                    : "Type your answer here"
                }
                className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
              />
              {value !== undefined && value !== null && value !== "" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground flex items-center gap-2 mt-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Answer saved
                </motion.p>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Fallback
  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Unsupported question type</p>
      </CardContent>
    </Card>
  );
}
