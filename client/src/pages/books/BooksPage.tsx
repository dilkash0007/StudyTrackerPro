import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Book as BookIcon,
  FileText,
  Search,
  PlusCircle,
  Clock,
  BookOpen,
  MoreVertical,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Book } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input as FormInput } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  NeuralCard,
  NeuralCardHeader,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";

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

    // Ensure books is an array before calling forEach
    const booksArray = Array.isArray(books) ? books : [];

    booksArray.forEach((book) => {
      if (book.category) {
        categories.add(book.category);
      }
    });

    return Array.from(categories);
  };

  // Filter books by search term and category
  const getFilteredBooks = () => {
    if (!books) return [];

    // Ensure books is an array before calling filter
    const booksArray = Array.isArray(books) ? books : [];

    return booksArray.filter((book) => {
      const matchesSearch =
        searchTerm === "" ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author &&
          book.author.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        activeCategory === "all" || book.category === activeCategory;

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
                Books
              </h1>
              <p className="text-gray-400">
                Track your reading progress and manage your study materials
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-800/50 border-teal-500/30 text-gray-100"
                />
              </div>

              <div className="flex space-x-2 w-full sm:w-auto">
                <Tabs
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="bg-gray-800/50 border border-teal-500/20">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                    >
                      All
                    </TabsTrigger>
                    {getCategories().map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-teal-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-gray-100">
                        Add New Book
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Title
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Book title"
                                  {...field}
                                  className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Author
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Book author"
                                  {...field}
                                  className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Category
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Category or subject"
                                    {...field}
                                    className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="totalPages"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Total Pages
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Number of pages"
                                    {...field}
                                    className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                URL
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Link to the book or resource"
                                  {...field}
                                  className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Notes
                              </FormLabel>
                              <FormControl>
                                <textarea
                                  {...field}
                                  placeholder="Additional notes about the book"
                                  className="w-full min-h-[100px] rounded-md border border-teal-500/30 bg-gray-900/30 text-gray-100 p-2"
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
                        onClick={() => setIsAddBookOpen(false)}
                        className="border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        onClick={form.handleSubmit(handleSubmit)}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                        disabled={createBookMutation.isPending}
                      >
                        {createBookMutation.isPending ? (
                          <div className="mr-2 h-4 w-4 animate-spin">⏳</div>
                        ) : (
                          <PlusCircle className="mr-2 h-4 w-4" />
                        )}
                        Add Book
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
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
                      <div className="w-full h-5 bg-gray-800 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))
              ) : getFilteredBooks().length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-1">
                    No books found
                  </h3>
                  <p className="text-gray-400">
                    {searchTerm
                      ? "Try a different search term"
                      : "Add your first book to start tracking your reading progress"}
                  </p>
                </div>
              ) : (
                getFilteredBooks().map((book) => (
                  <Card
                    key={book.id}
                    className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30"
                  >
                    <NeuralDots className="absolute top-0 right-0 w-24 h-24 opacity-10" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-gray-100 mr-2">
                          {book.title}
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
                              className="text-red-400 focus:text-red-300 focus:bg-red-900/20"
                              onClick={() => handleDeleteBook(book.id)}
                            >
                              Delete Book
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-sm font-normal text-gray-400">
                        {book.author}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {book.totalPages && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>
                              {book.currentPage || 0} / {book.totalPages} pages
                            </span>
                          </div>
                          <Progress
                            value={
                              ((book.currentPage || 0) / book.totalPages) * 100
                            }
                            className="h-2 bg-gray-800"
                            indicatorClassName="bg-teal-500"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
                            onClick={() =>
                              updateReadingProgress(
                                book,
                                (book.currentPage || 0) - 1
                              )
                            }
                            disabled={
                              !book.totalPages || (book.currentPage || 0) <= 0
                            }
                          >
                            -
                          </Button>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
                            onClick={() =>
                              updateReadingProgress(
                                book,
                                (book.currentPage || 0) + 1
                              )
                            }
                            disabled={
                              !book.totalPages ||
                              (book.currentPage || 0) >= book.totalPages
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {book.category && (
                          <div className="flex items-center text-xs">
                            <FileText className="h-3 w-3 text-teal-400 mr-1" />
                            <span className="text-gray-300">
                              {book.category}
                            </span>
                          </div>
                        )}
                        {book.lastRead && (
                          <div className="flex items-center text-xs">
                            <Clock className="h-3 w-3 text-teal-400 mr-1" />
                            <span className="text-gray-400">
                              Last read:{" "}
                              {format(new Date(book.lastRead), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      {book.url ? (
                        <a
                          href={book.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal-400 hover:text-teal-300 inline-flex items-center"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Open Resource
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No resource link
                        </span>
                      )}

                      <Input
                        type="number"
                        value={book.currentPage || 0}
                        onChange={(e) =>
                          updateReadingProgress(
                            book,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 h-8 text-center border-teal-500/30 bg-gray-900/30 text-gray-100"
                        min={0}
                        max={book.totalPages}
                        disabled={!book.totalPages}
                      />
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
