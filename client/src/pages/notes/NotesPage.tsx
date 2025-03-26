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
  DialogTrigger 
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
  Grid
} from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Note } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        description: error.message || "An error occurred while creating the note",
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
        description: error.message || "An error occurred while updating the note",
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
        description: error.message || "An error occurred while deleting the note",
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
    notes.forEach(note => {
      if (note.subject) {
        subjects.add(note.subject);
      }
    });
    
    return Array.from(subjects);
  };
  
  // Filter notes based on search term and subject
  const getFilteredNotes = () => {
    if (!notes) return [];
    
    return notes.filter(note => {
      const matchesSearch = searchTerm === "" || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSubject = filterSubject === "all" || 
        note.subject === filterSubject;
      
      return matchesSearch && matchesSubject;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };
  
  const subjects = getSubjects();
  const filteredNotes = getFilteredNotes();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <MobileHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate mb-4 sm:mb-0">
                Notes
              </h2>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search notes..."
                    className="pl-8 w-full sm:w-auto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Note</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...addForm}>
                      <form onSubmit={addForm.handleSubmit(handleAddNote)} className="space-y-4">
                        <FormField
                          control={addForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Note title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a subject (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="General">General</SelectItem>
                                  <SelectItem value="Physics">Physics</SelectItem>
                                  <SelectItem value="Math">Math</SelectItem>
                                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                                  <SelectItem value="Biology">Biology</SelectItem>
                                  <SelectItem value="History">History</SelectItem>
                                  <SelectItem value="English">English</SelectItem>
                                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Write your note here..." 
                                  className="min-h-[200px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit" disabled={createNoteMutation.isPending}>
                            {createNoteMutation.isPending ? "Creating..." : "Create Note"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex overflow-x-auto pb-2 space-x-2">
                <Button
                  variant={filterSubject === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterSubject("all")}
                >
                  All Notes
                </Button>
                
                {subjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={filterSubject === subject ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSubject(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  variant={viewMode === "grid" ? "default" : "outline"} 
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "outline"} 
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="animate-pulse divide-y">
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              <>
                {filteredNotes.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredNotes.map((note) => (
                        <Card key={note.id} className="group hover:shadow-md transition-shadow duration-200">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-lg mb-2">{note.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(note)}>
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {note.subject && (
                              <div className="mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {note.subject}
                                </span>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                              {note.content || "No content"}
                            </p>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {filteredNotes.map((note) => (
                            <div key={note.id} className="p-4 hover:bg-gray-50">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-medium text-lg">{note.title}</h3>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {note.content || "No content"}
                                  </p>
                                  
                                  <div className="flex items-center mt-2 space-x-3">
                                    {note.subject && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {note.subject}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEditDialog(note)}>
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleDeleteNote(note.id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <Folder className="h-12 w-12" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No notes found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterSubject !== "all" ? "Try a different search or filter" : "Create your first note to get started"}
                    </p>
                    <Button 
                      className="mt-6" 
                      onClick={() => setIsAddNoteOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Note
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* Edit Note Dialog */}
      <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditNote)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Note title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your note here..." 
                        className="min-h-[200px]" 
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
                  onClick={() => setIsEditNoteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateNoteMutation.isPending}>
                  {updateNoteMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
