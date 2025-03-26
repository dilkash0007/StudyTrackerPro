import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Book as BookIcon, 
  FileText, 
  Search, 
  PlusCircle, 
  Clock, 
  BookOpen,
  MoreVertical
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Book } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input as FormInput } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const bookFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  author: z.string().optional(),
  url: z.string().optional(),
  category: z.string().optional(),
  totalPages: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export default function BooksPage() {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Books data
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });
  
  // Book form
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      url: "",
      category: "",
      totalPages: undefined,
      notes: "",
    },
  });
  
  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      const res = await apiRequest("POST", "/api/books", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setIsAddBookOpen(false);
      form.reset();
      toast({
        title: "Book added",
        description: "Your book has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding book",
        description: error.message || "An error occurred while adding the book",
        variant: "destructive",
      });
    },
  });
  
  // Update book mutation (for updating current page)
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Book> }) => {
      const res = await apiRequest("PUT", `/api/books/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
  });
  
  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/books/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Book deleted",
        description: "The book has been deleted successfully",
      });
    },
  });
  
  const handleSubmit = (data: BookFormValues) => {
    createBookMutation.mutate(data);
  };
  
  // Get unique categories from books
  const getCategories = () => {
    if (!books) return [];
    
    const categories = new Set<string>();
    books.forEach(book => {
      if (book.category) {
        categories.add(book.category);
      }
    });
    
    return Array.from(categories);
  };
  
  // Filter books by search term and category
  const getFilteredBooks = () => {
    if (!books) return [];
    
    return books.filter(book => {
      const matchesSearch = searchTerm === "" || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === "all" || 
        book.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  };
  
  // Track reading progress for a book
  const updateReadingProgress = (book: Book, newPage: number) => {
    if (newPage <= 0 || (book.totalPages && newPage > book.totalPages)) return;
    
    updateBookMutation.mutate({
      id: book.id,
      data: {
        currentPage: newPage,
        lastRead: new Date().toISOString(),
      },
    });
  };
  
  const handleDeleteBook = (id: number) => {
    if (confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(id);
    }
  };
  
  const filteredBooks = getFilteredBooks();
  const categories = getCategories();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <MobileHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate mb-4 sm:mb-0">
                Books & PDFs
              </h2>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search books..."
                    className="pl-8 w-full sm:w-auto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Book</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <FormInput placeholder="Book title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author</FormLabel>
                              <FormControl>
                                <FormInput placeholder="Author name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL</FormLabel>
                              <FormControl>
                                <FormInput placeholder="Link to book or PDF" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                  <FormInput placeholder="e.g. Physics, Math" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="totalPages"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Pages</FormLabel>
                                <FormControl>
                                  <FormInput 
                                    type="number" 
                                    placeholder="Number of pages" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Input 
                                  as="textarea" 
                                  placeholder="Additional notes" 
                                  className="h-20 resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit" disabled={createBookMutation.isPending}>
                            {createBookMutation.isPending ? "Adding..." : "Add Book"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex overflow-x-auto pb-2 space-x-2">
                  <Button
                    variant={activeCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory("all")}
                  >
                    All
                  </Button>
                  
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                
                <TabsList>
                  <TabsTrigger value="grid">
                    <BookIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <FileText className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="grid">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <div className="h-44 bg-gray-200 rounded-t-md"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredBooks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredBooks.map((book) => (
                          <Card key={book.id} className="overflow-hidden flex flex-col">
                            <div className="h-44 bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-16 w-16 text-primary/60" />
                            </div>
                            <CardContent className="p-4 flex-grow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-lg line-clamp-2">{book.title}</h3>
                                  {book.author && (
                                    <p className="text-sm text-gray-500">{book.author}</p>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => handleDeleteBook(book.id)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              {book.category && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {book.category}
                                  </span>
                                </div>
                              )}
                              
                              {book.totalPages && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{book.currentPage || 0} / {book.totalPages}</span>
                                  </div>
                                  <Progress 
                                    value={book.totalPages ? (book.currentPage || 0) / book.totalPages * 100 : 0} 
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between items-center bg-gray-50 border-t">
                              {book.lastRead ? (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Last read: {format(new Date(book.lastRead), 'MMM d, yyyy')}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500">Never opened</span>
                              )}
                              
                              <Button variant="outline" size="sm">Read</Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No books found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? "Try a different search term" : "Add your first book to get started"}
                        </p>
                        <Button 
                          className="mt-6" 
                          onClick={() => setIsAddBookOpen(true)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Book
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="list">
                <Card>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="animate-pulse divide-y">
                        {[...Array(5)].map((_, index) => (
                          <div key={index} className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {filteredBooks.length > 0 ? (
                          <div className="divide-y">
                            {filteredBooks.map((book) => (
                              <div key={book.id} className="p-4 flex items-start">
                                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded mr-4">
                                  <BookOpen className="h-6 w-6 text-primary/60" />
                                </div>
                                <div className="flex-grow">
                                  <div className="flex justify-between">
                                    <div>
                                      <h3 className="font-medium">{book.title}</h3>
                                      {book.author && (
                                        <p className="text-sm text-gray-500">{book.author}</p>
                                      )}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-red-600"
                                          onClick={() => handleDeleteBook(book.id)}
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  <div className="flex items-center mt-2">
                                    {book.category && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                        {book.category}
                                      </span>
                                    )}
                                    
                                    {book.lastRead && (
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Last read: {format(new Date(book.lastRead), 'MMM d, yyyy')}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {book.totalPages && (
                                    <div className="mt-3 flex items-center">
                                      <div className="flex-grow mr-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                          <span>Progress</span>
                                          <span>{book.currentPage || 0} / {book.totalPages}</span>
                                        </div>
                                        <Progress 
                                          value={book.totalPages ? (book.currentPage || 0) / book.totalPages * 100 : 0} 
                                          className="h-2"
                                        />
                                      </div>
                                      <Button variant="outline" size="sm">Read</Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No books found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {searchTerm ? "Try a different search term" : "Add your first book to get started"}
                            </p>
                            <Button 
                              className="mt-6" 
                              onClick={() => setIsAddBookOpen(true)}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Book
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
