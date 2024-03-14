import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useTrivia } from "@/hooks/use-trivia";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export const TriviaModal = () => {
  const { isOpen, onClose, id, turn } = useTrivia();
  const battle = useQuery(api.battle.trivia, id !== null ? { id } : "skip");

  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [topic, setTopic] = useState("react the programming language");

  const triviaAnswer = useMutation(api.battle.answerTrivia);
  const generateQuestion = useMutation(api.battle.generateQuestion);
  const setSequenceMutation = useMutation(api.battle.setBattleSequence);

  if (!battle) {
    return null;
  }

  if (!id || turn === null || turn === undefined) {
    if (isOpen) {
      toast.error("battle, id or turn is null");
      console.log(`battle: ${battle?._id}, id: ${id}, turn: ${turn} is`);
    }

    return null;
  }

  const handleAnswer = () => {
    try {
      if (
        id !== null &&
        battle?.trivia !== null &&
        battle?.trivia !== undefined
      ) {
        triviaAnswer({ id, answer, question: battle.trivia });
      }
    } catch (e) {
      toast.error("Looks like you got it wrong" + e);
    }
  };

  const handleGenerateQuestion = () => {
    if (!topic || !difficulty || !id) {
      toast.error("Please fill in all fields");
      return;
    }
    generateQuestion({ level: difficulty, topic, id });
  };
  const handleAction = () => {
    if (battle.triviaResult) {
      setSequenceMutation({
        id: id,
        mode: "special",
        turn,
      });
      onClose();
    } else {
      setSequenceMutation({
        id: id,
        mode: "attack",
        turn,
      });
      toast.message("You got it wrong, preparing weak attack ");
      onClose();
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(event.target.value);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
  };

  const handleTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(event.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>Trivia</DialogHeader>
        {!battle.triviaRationale && (
          <>
            {!battle.trivia ? (
              <>
                <Label>Choose your topic and difficulty level</Label>
                <Input
                  onChange={handleTopicChange}
                  value={topic}
                  placeholder="Type topic here"
                />
                <RadioGroup
                  defaultValue="easy"
                  onValueChange={handleDifficultyChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy">Easy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Medium" id="Medium" />
                    <Label htmlFor="Medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Hard" id="Hard" />
                    <Label htmlFor="Hard">Hard</Label>
                  </div>
                </RadioGroup>
                <Button onClick={handleGenerateQuestion}>
                  Generate Question
                </Button>
              </>
            ) : (
              <>
                <div>{battle.trivia}</div>
                <Textarea onChange={handleTextChange} value={answer} />
                <Button onClick={handleAnswer}>Submit</Button>
              </>
            )}
          </>
        )}
        {battle.triviaRationale && (
          <div>
            <div>{battle.triviaRationale}</div>
            <Button onClick={() => handleAction()}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
