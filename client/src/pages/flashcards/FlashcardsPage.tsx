import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  ArrowRight,
  Clock,
  Layers,
  Tag,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FlashcardDeck, Flashcard } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  NeuralCard,
  NeuralCardHeader,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";

const deckFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  subject: z.string().optional(),
});

const flashcardFormSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
  answer: z.string().min(1, { message: "Answer is required" }),
});

type DeckFormValues = z.infer<typeof deckFormSchema>;
type FlashcardFormValues = z.infer<typeof flashcardFormSchema>;

export default function FlashcardsPage() {
  const [isAddDeckOpen, setIsAddDeckOpen] = useState(false);
  const [isEditDeckOpen, setIsEditDeckOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditCardOpen, setIsEditCardOpen] = useState(false);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [activeCard, setActiveCard] = useState<Flashcard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Decks data
  const { data: decks, isLoading: isLoadingDecks } = useQuery<FlashcardDeck[]>({
    queryKey: ["/api/flashcard-decks"],
  });

  // Cards data for active deck
  const { data: cards, isLoading: isLoadingCards } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards", activeDeck?.id],
    enabled: !!activeDeck,
  });

  // Deck forms
  const addDeckForm = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
    },
  });

  const editDeckForm = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
    },
  });

  // Card forms
  const addCardForm = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const editCardForm = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  // Create deck mutation
  const createDeckMutation = useMutation({
    mutationFn: async (data: DeckFormValues) => {
      const res = await apiRequest("POST", "/api/flashcard-decks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks"] });
      setIsAddDeckOpen(false);
      addDeckForm.reset();
      toast({
        title: "Deck created",
        description: "Your flashcard deck has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating deck",
        description:
          error.message || "An error occurred while creating the deck",
        variant: "destructive",
      });
    },
  });

  // Update deck mutation
  const updateDeckMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DeckFormValues }) => {
      const res = await apiRequest("PUT", `/api/flashcard-decks/${id}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks"] });
      setIsEditDeckOpen(false);

      // Update the active deck if it was edited
      if (activeDeck && activeDeck.id === variables.id) {
        setActiveDeck((prevDeck) => {
          if (!prevDeck) return null;
          return { ...prevDeck, ...variables.data };
        });
      }

      toast({
        title: "Deck updated",
        description: "Your flashcard deck has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating deck",
        description:
          error.message || "An error occurred while updating the deck",
        variant: "destructive",
      });
    },
  });

  // Delete deck mutation
  const deleteDeckMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(
        "DELETE",
        `/api/flashcard-decks/${id}`,
        undefined
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks"] });

      // If the active deck was deleted, reset it
      if (activeDeck && deleteDeckMutation.variables === activeDeck.id) {
        setActiveDeck(null);
        setStudyMode(false);
      }

      toast({
        title: "Deck deleted",
        description: "Your flashcard deck has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting deck",
        description:
          error.message || "An error occurred while deleting the deck",
        variant: "destructive",
      });
    },
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (data: FlashcardFormValues) => {
      if (!activeDeck) return null;
      const res = await apiRequest("POST", "/api/flashcards", {
        ...data,
        deckId: activeDeck.id,
      });
      return res.json();
    },
    onSuccess: () => {
      if (activeDeck) {
        queryClient.invalidateQueries({
          queryKey: ["/api/flashcards", activeDeck.id],
        });
      }
      setIsAddCardOpen(false);
      addCardForm.reset();
      toast({
        title: "Flashcard created",
        description: "Your flashcard has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating flashcard",
        description:
          error.message || "An error occurred while creating the flashcard",
        variant: "destructive",
      });
    },
  });

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: FlashcardFormValues;
    }) => {
      const res = await apiRequest("PUT", `/api/flashcards/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      if (activeDeck) {
        queryClient.invalidateQueries({
          queryKey: ["/api/flashcards", activeDeck.id],
        });
      }
      setIsEditCardOpen(false);
      setActiveCard(null);
      toast({
        title: "Flashcard updated",
        description: "Your flashcard has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating flashcard",
        description:
          error.message || "An error occurred while updating the flashcard",
        variant: "destructive",
      });
    },
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(
        "DELETE",
        `/api/flashcards/${id}`,
        undefined
      );
      return res.json();
    },
    onSuccess: () => {
      if (activeDeck) {
        queryClient.invalidateQueries({
          queryKey: ["/api/flashcards", activeDeck.id],
        });
      }
      toast({
        title: "Flashcard deleted",
        description: "Your flashcard has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting flashcard",
        description:
          error.message || "An error occurred while deleting the flashcard",
        variant: "destructive",
      });
    },
  });

  // Update card mastery mutation
  const updateCardMasteryMutation = useMutation({
    mutationFn: async ({ id, mastery }: { id: number; mastery: number }) => {
      const res = await apiRequest("PUT", `/api/flashcards/${id}`, {
        mastery,
        lastReviewed: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      if (activeDeck) {
        queryClient.invalidateQueries({
          queryKey: ["/api/flashcards", activeDeck.id],
        });
      }
    },
  });

  const handleAddDeck = (data: DeckFormValues) => {
    createDeckMutation.mutate(data);
  };

  const handleEditDeck = (data: DeckFormValues) => {
    if (!activeDeck) return;
    updateDeckMutation.mutate({ id: activeDeck.id, data });
  };

  const handleDeleteDeck = (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this deck? All flashcards in the deck will also be deleted."
      )
    ) {
      deleteDeckMutation.mutate(id);
    }
  };

  const handleAddCard = (data: FlashcardFormValues) => {
    createCardMutation.mutate(data);
  };

  const handleEditCard = (data: FlashcardFormValues) => {
    if (!activeCard) return;
    updateCardMutation.mutate({ id: activeCard.id, data });
  };

  const handleDeleteCard = (id: number) => {
    if (confirm("Are you sure you want to delete this flashcard?")) {
      deleteCardMutation.mutate(id);
    }
  };

  const openEditDeckDialog = (deck: FlashcardDeck) => {
    setActiveDeck(deck);
    editDeckForm.reset({
      title: deck.title,
      description: deck.description || "",
      subject: deck.subject || "",
    });
    setIsEditDeckOpen(true);
  };

  const openEditCardDialog = (card: Flashcard) => {
    setActiveCard(card);
    editCardForm.reset({
      question: card.question,
      answer: card.answer,
    });
    setIsEditCardOpen(true);
  };

  const selectDeck = (deck: FlashcardDeck) => {
    setActiveDeck(deck);
    setStudyMode(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const enterStudyMode = () => {
    setStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const exitStudyMode = () => {
    setStudyMode(false);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (!cards) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    if (!cards) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const markCardMastery = (mastery: number) => {
    if (!cards || currentCardIndex >= cards.length) return;
    const card = cards[currentCardIndex];
    updateCardMasteryMutation.mutate({ id: card.id, mastery });
    nextCard();
  };

  // Filter decks by search term
  const getFilteredDecks = () => {
    if (!decks) return [];

    // Ensure decks is an array
    const decksArray = Array.isArray(decks) ? decks : [];

    return decksArray.filter((deck) => {
      return (
        searchTerm === "" ||
        deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deck.description &&
          deck.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deck.subject &&
          deck.subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  };

  const filteredDecks = getFilteredDecks();

  // Calculate deck stats
  const getDeckStats = () => {
    if (!cards || cards.length === 0)
      return { total: 0, mastered: 0, learning: 0, progress: 0 };

    // Ensure cards is an array
    const cardsArray = Array.isArray(cards) ? cards : [];

    const total = cardsArray.length;
    const mastered = cardsArray.filter(
      (card) => (card.mastery || 0) >= 3
    ).length;
    const learning = cardsArray.filter(
      (card) => (card.mastery || 0) > 0 && (card.mastery || 0) < 3
    ).length;
    const progress = Math.round((mastered / total) * 100);

    return { total, mastered, learning, progress };
  };

  const deckStats = getDeckStats();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <NeuralBackgroundDecoration />

        <div className="absolute top-1/4 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>

        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate mb-4 sm:mb-0">
                {activeDeck ? (
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      className="mr-2 -ml-2"
                      onClick={() => setActiveDeck(null)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    {activeDeck.title}
                  </div>
                ) : (
                  "Flashcards"
                )}
              </h2>

              <div className="flex space-x-2">
                {!activeDeck ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search decks..."
                        className="pl-8 w-full sm:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Dialog
                      open={isAddDeckOpen}
                      onOpenChange={setIsAddDeckOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          New Deck
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Flashcard Deck</DialogTitle>
                        </DialogHeader>

                        <Form {...addDeckForm}>
                          <form
                            onSubmit={addDeckForm.handleSubmit(handleAddDeck)}
                            className="space-y-4"
                          >
                            <FormField
                              control={addDeckForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Deck title"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addDeckForm.control}
                              name="subject"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. Physics, Math"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addDeckForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe what this deck is about"
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <DialogFooter>
                              <Button
                                type="submit"
                                disabled={createDeckMutation.isPending}
                              >
                                {createDeckMutation.isPending
                                  ? "Creating..."
                                  : "Create Deck"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : studyMode ? (
                  <Button variant="outline" onClick={exitStudyMode}>
                    Exit Study Mode
                  </Button>
                ) : (
                  <>
                    <Dialog
                      open={isAddCardOpen}
                      onOpenChange={setIsAddCardOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Flashcard</DialogTitle>
                        </DialogHeader>

                        <Form {...addCardForm}>
                          <form
                            onSubmit={addCardForm.handleSubmit(handleAddCard)}
                            className="space-y-4"
                          >
                            <FormField
                              control={addCardForm.control}
                              name="question"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Question</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Front side of the card"
                                      className="min-h-[100px] resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addCardForm.control}
                              name="answer"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Answer</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Back side of the card"
                                      className="min-h-[100px] resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <DialogFooter>
                              <Button
                                type="submit"
                                disabled={createCardMutation.isPending}
                              >
                                {createCardMutation.isPending
                                  ? "Adding..."
                                  : "Add Card"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={enterStudyMode}>
                      Study Deck
                    </Button>
                  </>
                )}
              </div>
            </div>

            {activeDeck ? (
              studyMode ? (
                // Study mode
                <div className="flex flex-col items-center">
                  {cards && cards.length > 0 ? (
                    <>
                      <div className="w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-gray-500">
                            Card {currentCardIndex + 1} of {cards.length}
                          </p>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={flipCard}
                            >
                              {isFlipped ? (
                                <EyeOff className="h-4 w-4 mr-1" />
                              ) : (
                                <Eye className="h-4 w-4 mr-1" />
                              )}
                              {isFlipped ? "Hide Answer" : "Show Answer"}
                            </Button>
                          </div>
                        </div>

                        <Card className="relative h-80 mb-8">
                          <div
                            className={`absolute inset-0 flex flex-col justify-center items-center p-6 transition-all duration-500 ${
                              isFlipped
                                ? "opacity-0 rotate-y-180"
                                : "opacity-100"
                            }`}
                          >
                            <div className="text-xl font-medium text-center">
                              {cards[currentCardIndex].question}
                            </div>
                            <Button
                              variant="ghost"
                              className="absolute bottom-4"
                              onClick={flipCard}
                            >
                              Tap to flip
                            </Button>
                          </div>
                          <div
                            className={`absolute inset-0 flex flex-col justify-center items-center p-6 transition-all duration-500 ${
                              isFlipped
                                ? "opacity-100"
                                : "opacity-0 rotate-y-180"
                            }`}
                          >
                            <div className="text-xl font-medium text-center">
                              {cards[currentCardIndex].answer}
                            </div>
                            <Button
                              variant="ghost"
                              className="absolute bottom-4"
                              onClick={flipCard}
                            >
                              Tap to flip
                            </Button>
                          </div>
                        </Card>

                        <div className="flex justify-center space-x-4 mb-4">
                          <Button variant="outline" onClick={prevCard}>
                            <ChevronLeft className="h-5 w-5 mr-1" />
                            Previous
                          </Button>
                          <Button variant="outline" onClick={nextCard}>
                            Next
                            <ChevronRight className="h-5 w-5 ml-1" />
                          </Button>
                        </div>

                        {isFlipped && (
                          <div className="flex justify-center space-x-4 mt-4">
                            <p className="text-sm text-gray-500 mr-2">
                              How well did you know this?
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => markCardMastery(0)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Not at all
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-500"
                              onClick={() => markCardMastery(1)}
                            >
                              Barely
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500"
                              onClick={() => markCardMastery(2)}
                            >
                              Somewhat
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-500"
                              onClick={() => markCardMastery(3)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Perfectly
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Layers className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No flashcards in this deck
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add some cards to start studying
                      </p>
                      <Button
                        className="mt-6"
                        onClick={() => {
                          setStudyMode(false);
                          setIsAddCardOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Card
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // Deck view
                <div>
                  <div className="mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="text-lg font-medium mb-2">
                              Deck Details
                            </h3>
                            {activeDeck.description && (
                              <p className="text-gray-600 mb-2">
                                {activeDeck.description}
                              </p>
                            )}
                            {activeDeck.subject && (
                              <Badge variant="secondary">
                                {activeDeck.subject}
                              </Badge>
                            )}
                          </div>

                          <div className="mt-4 sm:mt-0">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                              Progress
                            </h4>
                            <Progress
                              value={deckStats.progress}
                              className="w-40 h-2"
                            />
                            <div className="flex mt-2 text-xs text-gray-500">
                              <span>{deckStats.mastered} mastered</span>
                              <span className="mx-2">•</span>
                              <span>{deckStats.learning} learning</span>
                              <span className="mx-2">•</span>
                              <span>{deckStats.total} total</span>
                            </div>

                            <div className="flex space-x-2 mt-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDeckDialog(activeDeck)}
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDeleteDeck(activeDeck.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Flashcards</h3>
                    {cards && cards.length > 0 && (
                      <Button onClick={enterStudyMode}>Start Studying</Button>
                    )}
                  </div>

                  {isLoadingCards ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, index) => (
                        <Skeleton key={index} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {cards && cards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cards.map((card) => (
                            <Card
                              key={card.id}
                              className="group hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="w-full mr-2">
                                    <p className="font-medium mb-2 line-clamp-2">
                                      {card.question}
                                    </p>
                                    <div className="h-px bg-gray-200 my-2"></div>
                                    <p className="text-gray-600 line-clamp-2">
                                      {card.answer}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => openEditCardDialog(card)}
                                      >
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                          handleDeleteCard(card.id)
                                        }
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                {card.lastReviewed && (
                                  <div className="mt-3 text-xs text-gray-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Last reviewed:{" "}
                                    {format(
                                      new Date(card.lastReviewed),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Layers className="h-12 w-12 mx-auto text-gray-400" />
                          <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No flashcards in this deck
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Add some cards to start studying
                          </p>
                          <Button
                            className="mt-6"
                            onClick={() => setIsAddCardOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Card
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            ) : (
              // Decks list
              <div>
                {isLoadingDecks ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <Skeleton key={index} className="h-40 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredDecks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDecks.map((deck) => (
                          <Card
                            key={deck.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => selectDeck(deck)}
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">
                                    {deck.title}
                                  </h3>
                                  {deck.description && (
                                    <p className="text-gray-600 mt-1 line-clamp-2">
                                      {deck.description}
                                    </p>
                                  )}
                                </div>
                                <div className="p-2 bg-primary/10 rounded-md text-primary">
                                  <Layers className="h-5 w-5" />
                                </div>
                              </div>

                              <div className="flex items-center mt-4">
                                {deck.subject && (
                                  <Badge variant="secondary" className="mr-2">
                                    {deck.subject}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  Created{" "}
                                  {format(
                                    new Date(deck.createdAt),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50 px-6 py-3 border-t flex justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-auto"
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                View Cards
                              </Button>

                              <div className="flex">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditDeckDialog(deck);
                                      }}
                                    >
                                      <Edit3 className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDeck(deck.id);
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <Layers className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                          No flashcard decks found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm
                            ? "Try a different search term"
                            : "Create your first deck to get started"}
                        </p>
                        <Button
                          className="mt-6"
                          onClick={() => setIsAddDeckOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Deck
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Deck Dialog */}
      <Dialog open={isEditDeckOpen} onOpenChange={setIsEditDeckOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flashcard Deck</DialogTitle>
          </DialogHeader>

          <Form {...editDeckForm}>
            <form
              onSubmit={editDeckForm.handleSubmit(handleEditDeck)}
              className="space-y-4"
            >
              <FormField
                control={editDeckForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Deck title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editDeckForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Physics, Math" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editDeckForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this deck is about"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDeckOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateDeckMutation.isPending}>
                  {updateDeckMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={isEditCardOpen} onOpenChange={setIsEditCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>

          <Form {...editCardForm}>
            <form
              onSubmit={editCardForm.handleSubmit(handleEditCard)}
              className="space-y-4"
            >
              <FormField
                control={editCardForm.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Front side of the card"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editCardForm.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Back side of the card"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditCardOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCardMutation.isPending}>
                  {updateCardMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
