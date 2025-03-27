import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star,
  Clock,
  Tag,
  Folder,
  List,
  Grid,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Note } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  NeuralCard,
  NeuralCardHeader,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
  subject: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

export default function NotesPage() {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Notes data
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  // Add note form
  const addForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      subject: "",
    },
  });

  // Edit note form
  const editForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      subject: "",
    },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteFormValues) => {
      const res = await apiRequest("POST", "/api/notes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsAddNoteOpen(false);
      addForm.reset();
      toast({
        title: "Note created",
        description: "Your note has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating note",
        description:
          error.message || "An error occurred while creating the note",
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: NoteFormValues }) => {
      const res = await apiRequest("PUT", `/api/notes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsEditNoteOpen(false);
      setActiveNote(null);
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating note",
        description:
          error.message || "An error occurred while updating the note",
        variant: "destructive",
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/notes/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setActiveNote(null);
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting note",
        description:
          error.message || "An error occurred while deleting the note",
        variant: "destructive",
      });
    },
  });

  const handleAddNote = (data: NoteFormValues) => {
    createNoteMutation.mutate(data);
  };

  const handleEditNote = (data: NoteFormValues) => {
    if (!activeNote) return;
    updateNoteMutation.mutate({ id: activeNote.id, data });
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const openEditDialog = (note: Note) => {
    setActiveNote(note);
    editForm.reset({
      title: note.title,
      content: note.content || "",
      subject: note.subject || "",
    });
    setIsEditNoteOpen(true);
  };

  // Get unique subjects from notes
  const getSubjects = () => {
    if (!notes) return [];

    const subjects = new Set<string>();

    // Ensure notes is an array
    const notesArray = Array.isArray(notes) ? notes : [];

    notesArray.forEach((note) => {
      if (note.subject) {
        subjects.add(note.subject);
      }
    });

    return Array.from(subjects);
  };

  // Filter notes based on search term and subject
  const getFilteredNotes = () => {
    if (!notes) return [];

    // Ensure notes is an array
    const notesArray = Array.isArray(notes) ? notes : [];

    return notesArray
      .filter((note) => {
        const matchesSearch =
          searchTerm === "" ||
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (note.content &&
            note.content.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSubject =
          filterSubject === "all" || note.subject === filterSubject;

        return matchesSearch && matchesSubject;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  };

  const subjects = getSubjects();
  const filteredNotes = getFilteredNotes();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <NeuralBackgroundDecoration />

        <div className="absolute top-1/4 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>

        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                Notes
              </h1>
              <p className="text-gray-400">
                Create and organize your study notes
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-800/50 border-teal-500/30 text-gray-100"
                />
              </div>

              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-gray-800/50 border-teal-500/30 text-gray-100">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-teal-500/30">
                    <SelectItem value="all">All Subjects</SelectItem>
                    {getSubjects().map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex bg-gray-800/50 border border-teal-500/20 rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 ${
                      viewMode === "grid"
                        ? "bg-teal-500/20 text-teal-300"
                        : "text-gray-400"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 ${
                      viewMode === "list"
                        ? "bg-teal-500/20 text-teal-300"
                        : "text-gray-400"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-teal-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-gray-100">
                        Create New Note
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...addForm}>
                      <form
                        onSubmit={addForm.handleSubmit(handleAddNote)}
                        className="space-y-4"
                      >
                        <FormField
                          control={addForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Title
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Note title"
                                  {...field}
                                  className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Subject (optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Physics, Math, Biology"
                                  {...field}
                                  className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Content
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Note content..."
                                  className="min-h-[200px] border-teal-500/30 bg-gray-900/30 text-gray-100"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddNoteOpen(false)}
                        className="border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        onClick={addForm.handleSubmit(handleAddNote)}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                        disabled={createNoteMutation.isPending}
                      >
                        {createNoteMutation.isPending ? (
                          <div className="mr-2 h-4 w-4 animate-spin">⏳</div>
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Create Note
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {isLoading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card
                    key={i}
                    className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30"
                  >
                    <NeuralDots className="absolute top-0 right-0 w-24 h-24 opacity-10" />
                    <CardHeader className="pb-2">
                      <div className="w-3/4 h-4 bg-gray-800 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-3 bg-gray-800 rounded animate-pulse mb-2"></div>
                      <div className="w-2/3 h-3 bg-gray-800 rounded animate-pulse mb-4"></div>
                      <div className="w-full h-24 bg-gray-800 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : getFilteredNotes().length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-1">
                  No notes found
                </h3>
                <p className="text-gray-400">
                  {searchTerm || filterSubject !== "all"
                    ? "Try different search terms or filters"
                    : "Create your first note to get started"}
                </p>
                <Button
                  onClick={() => setIsAddNoteOpen(true)}
                  className="mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {getFilteredNotes().map((note) => (
                  <Card
                    key={note.id}
                    className={`relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30 ${
                      viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                    }`}
                  >
                    <NeuralDots className="absolute top-0 right-0 w-24 h-24 opacity-10" />

                    <div className={viewMode === "list" ? "sm:w-1/3" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-gray-100 mr-2">
                            {note.title}
                          </CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-800/50"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-900 border-teal-500/30">
                              <DropdownMenuItem
                                className="text-gray-300 focus:text-teal-300 focus:bg-teal-900/20"
                                onClick={() => openEditDialog(note)}
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 focus:text-red-300 focus:bg-red-900/20"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {note.subject && (
                          <div className="inline-flex items-center px-2 py-1 mt-1 text-xs rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                            <Tag className="h-3 w-3 mr-1" />
                            {note.subject}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {format(
                            new Date(note.updatedAt || note.createdAt),
                            "MMM d, yyyy"
                          )}
                        </div>
                      </CardHeader>
                    </div>

                    <div className={viewMode === "list" ? "sm:w-2/3" : ""}>
                      <CardContent>
                        <p className="text-gray-300 line-clamp-4 whitespace-pre-line">
                          {note.content}
                        </p>
                        {viewMode === "grid" &&
                          note.content &&
                          note.content.length > 160 && (
                            <Button
                              variant="link"
                              onClick={() => openEditDialog(note)}
                              className="p-0 h-auto mt-2 text-teal-400 hover:text-teal-300"
                            >
                              Read more
                            </Button>
                          )}
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
        <DialogContent className="bg-gray-900 border-teal-500/30 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Edit Note</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditNote)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Subject (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Content</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[300px] border-teal-500/30 bg-gray-900/30 text-gray-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditNoteOpen(false)}
              className="border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={editForm.handleSubmit(handleEditNote)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
              disabled={updateNoteMutation.isPending}
            >
              {updateNoteMutation.isPending ? (
                <div className="mr-2 h-4 w-4 animate-spin">⏳</div>
              ) : (
                <Edit3 className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
