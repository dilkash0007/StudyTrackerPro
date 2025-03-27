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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Users,
  Award,
  User as UserIcon,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  BookOpen,
  Clock,
  Flame,
} from "lucide-react";
import { useState } from "react";
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  NeuralCard,
  NeuralCardHeader,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";

// Mock user data for the community page
// This would normally come from an API
const mockUsers = [
  {
    id: 1,
    username: "sarah_math",
    fullName: "Sarah Johnson",
    profilePicture: "",
    subject: "Mathematics",
    streak: 42,
    studyHours: 124,
    rank: 1,
  },
  {
    id: 2,
    username: "alex_physics",
    fullName: "Alex Thompson",
    profilePicture: "",
    subject: "Physics",
    streak: 38,
    studyHours: 112,
    rank: 2,
  },
  {
    id: 3,
    username: "michael_chem",
    fullName: "Michael Chen",
    profilePicture: "",
    subject: "Chemistry",
    streak: 35,
    studyHours: 105,
    rank: 3,
  },
  {
    id: 4,
    username: "lisa_bio",
    fullName: "Lisa Martinez",
    profilePicture: "",
    subject: "Biology",
    streak: 32,
    studyHours: 98,
    rank: 4,
  },
  {
    id: 5,
    username: "david_cs",
    fullName: "David Wilson",
    profilePicture: "",
    subject: "Computer Science",
    streak: 30,
    studyHours: 90,
    rank: 5,
  },
];

// Mock discussion posts
const mockPosts = [
  {
    id: 1,
    author: "sarah_math",
    authorFullName: "Sarah Johnson",
    title: "Tips for memorizing calculus formulas?",
    content:
      "I'm struggling to remember all the integration formulas for my upcoming exam. Any suggestions on effective memorization techniques?",
    likes: 24,
    comments: 7,
    timestamp: "2 hours ago",
    tags: ["Calculus", "Study Tips"],
  },
  {
    id: 2,
    author: "alex_physics",
    authorFullName: "Alex Thompson",
    title: "Study group for quantum mechanics",
    content:
      "Looking to form a study group for quantum mechanics. We can meet virtually twice a week. Anyone interested?",
    likes: 15,
    comments: 12,
    timestamp: "Yesterday",
    tags: ["Physics", "Quantum Mechanics", "Study Group"],
  },
  {
    id: 3,
    author: "michael_chem",
    authorFullName: "Michael Chen",
    title: "Best resources for organic chemistry?",
    content:
      "I'm looking for good resources to study organic chemistry reaction mechanisms. Any recommendations for textbooks, videos, or websites?",
    likes: 32,
    comments: 18,
    timestamp: "3 days ago",
    tags: ["Chemistry", "Resources"],
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = mockPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleConnectClick = (username: string) => {
    toast({
      title: "Connection Request Sent",
      description: `You've sent a connection request to ${username}`,
    });
  };

  const handlePostLike = (postId: number) => {
    toast({
      title: "Post Liked",
      description: "You've liked this post",
    });
  };

  const handlePostComment = (postId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "Commenting feature will be available soon!",
    });
  };

  const handlePostShare = (postId: number) => {
    toast({
      title: "Post Shared",
      description: "Post link copied to clipboard",
    });
  };

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
                Community
              </h2>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search community..."
                  className="pl-8 w-full sm:w-auto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs
              defaultValue="leaderboard"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="leaderboard">
                  <Award className="h-4 w-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="discussions">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Top Students This Week</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left font-medium text-gray-500">
                                Rank
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500">
                                Student
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500">
                                Focus
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500">
                                Streak
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500">
                                Study Hours
                              </th>
                              <th className="px-4 py-2 text-right font-medium text-gray-500">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((user) => (
                                <tr
                                  key={user.id}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="px-4 py-4">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-50 text-primary font-medium">
                                      {user.rank}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center">
                                      <Avatar className="h-8 w-8 mr-2">
                                        <AvatarFallback>
                                          {user.username
                                            .charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">
                                          {user.fullName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          @{user.username}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      {user.subject}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center">
                                      <Flame className="h-4 w-4 text-orange-500 mr-1" />
                                      <span>{user.streak} days</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 text-primary mr-1" />
                                      <span>{user.studyHours} hours</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleConnectClick(user.username)
                                      }
                                    >
                                      <Users className="h-4 w-4 mr-1" />
                                      Connect
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-8 text-center text-gray-500"
                                >
                                  No users found matching your search.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Rankings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Weekly Rank
                          </span>
                          <span className="text-sm font-medium">#24</span>
                        </div>
                        <Progress value={76} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          You're in the top 24% of students this week
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Current Streak
                          </span>
                          <span className="text-sm font-medium">18 days</span>
                        </div>
                        <Progress value={60} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          Keep going! 12 more days to beat your record
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Study Hours
                          </span>
                          <span className="text-sm font-medium">63 hours</span>
                        </div>
                        <Progress value={42} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          42% of the average top performer
                        </p>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">
                          This Week's Achievements
                        </h4>
                        <div className="flex space-x-2">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary flex items-center justify-center">
                              <Flame className="h-5 w-5" />
                            </div>
                            <span className="text-xs mt-1">7-Day</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5" />
                            </div>
                            <span className="text-xs mt-1">20h+</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="text-xs mt-1">Reader</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Study Groups Near You</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="font-medium mb-2">
                            Physics Study Marathon
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Join us for an intensive weekend of physics problem
                            solving and exam prep.
                          </p>
                          <div className="mb-4">
                            <Badge className="mr-2 mb-2">Physics</Badge>
                            <Badge variant="outline" className="mb-2">
                              Weekend
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Users className="h-4 w-4 mr-2" />
                            12 members
                          </div>
                          <Button className="w-full">Join Group</Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <h3 className="font-medium mb-2">
                            Math Tutoring Exchange
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            A community where students help each other with math
                            problems and concepts.
                          </p>
                          <div className="mb-4">
                            <Badge className="mr-2 mb-2">Mathematics</Badge>
                            <Badge variant="outline" className="mb-2">
                              Weekly
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Users className="h-4 w-4 mr-2" />
                            28 members
                          </div>
                          <Button className="w-full">Join Group</Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <h3 className="font-medium mb-2">
                            Computer Science Projects
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Collaborate on CS projects while learning and
                            building your portfolio.
                          </p>
                          <div className="mb-4">
                            <Badge className="mr-2 mb-2">
                              Computer Science
                            </Badge>
                            <Badge variant="outline" className="mb-2">
                              Ongoing
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Users className="h-4 w-4 mr-2" />
                            19 members
                          </div>
                          <Button className="w-full">Join Group</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t pt-4">
                    <Button variant="outline">Browse All Study Groups</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="discussions">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <Input
                          placeholder="Start a new discussion..."
                          className="mb-4"
                          onClick={() => {
                            toast({
                              title: "Create Post",
                              description: "Post creation feature coming soon!",
                            });
                          }}
                        />
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-500"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Study Material
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-500"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Question
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-500"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Study Group
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <Card key={post.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center mb-4">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {post.author.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {post.authorFullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  @{post.author} • {post.timestamp}
                                </div>
                              </div>
                            </div>

                            <h3 className="text-lg font-medium mb-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mb-4">{post.content}</p>

                            <div className="mb-4">
                              {post.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="mr-2 mb-2"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex space-x-4 text-gray-500">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center"
                                onClick={() => handlePostLike(post.id)}
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likes}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center"
                                onClick={() => handlePostComment(post.id)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {post.comments}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center"
                                onClick={() => handlePostShare(post.id)}
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                          <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No discussions found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchTerm
                              ? "Try a different search term"
                              : "Start a new discussion to get the conversation going"}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Trending Topics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">1.</span>
                            <span>#ExamPrep</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">2.</span>
                            <span>#StudyTips</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">3.</span>
                            <span>#MemorizationTechniques</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">4.</span>
                            <span>#PhysicsProblems</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">5.</span>
                            <span>#MathTutoring</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Active Users</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockUsers.slice(0, 3).map((user) => (
                          <div key={user.id} className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-xs text-gray-500">
                                @{user.username}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConnectClick(user.username)}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <Button variant="link" className="mx-auto">
                          View All Users
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Community Guidelines</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">
                          1. Be respectful and constructive in discussions.
                        </p>
                        <p className="text-sm">
                          2. Share knowledge and help others learn.
                        </p>
                        <p className="text-sm">
                          3. No plagiarism or cheating-related content.
                        </p>
                        <p className="text-sm">
                          4. Stay on topic in subject-specific channels.
                        </p>
                        <p className="text-sm">
                          5. Report inappropriate content to moderators.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
