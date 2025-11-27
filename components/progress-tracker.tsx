"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Briefcase,
  GraduationCap,
  BookOpen,
  Users,
  Target,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react"

const careerPaths = [
  {
    id: 1,
    title: "Senior Developer",
    estimatedTime: "6-8 months",
    progress: 85,
    requiredSkills: [
      { name: "Advanced React", status: "completed" },
      { name: "System Design", status: "in-progress" },
      { name: "Mentorship", status: "completed" },
      { name: "Code Review", status: "completed" },
    ],
    nextMilestone: "Complete System Design Course",
  },
  {
    id: 2,
    title: "Tech Lead",
    estimatedTime: "12-15 months",
    progress: 40,
    requiredSkills: [
      { name: "Team Leadership", status: "in-progress" },
      { name: "Architecture", status: "not-started" },
      { name: "Project Management", status: "in-progress" },
      { name: "Stakeholder Communication", status: "not-started" },
    ],
    nextMilestone: "Lead a Cross-functional Project",
  },
  {
    id: 3,
    title: "AI/ML Specialist",
    estimatedTime: "18-24 months",
    progress: 22,
    requiredSkills: [
      { name: "Machine Learning", status: "in-progress" },
      { name: "Python", status: "not-started" },
      { name: "Data Analysis", status: "not-started" },
      { name: "Neural Networks", status: "not-started" },
    ],
    nextMilestone: "Complete ML Fundamentals Course",
  },
]

const skillsData = [
  { name: "React", current: "Expert", target: "Expert", progress: 100, status: "completed" },
  { name: "TypeScript", current: "Advanced", target: "Expert", progress: 85, status: "in-progress" },
  { name: "System Design", current: "Intermediate", target: "Advanced", progress: 60, status: "in-progress" },
  { name: "Node.js", current: "Advanced", target: "Expert", progress: 80, status: "in-progress" },
  { name: "Leadership", current: "Beginner", target: "Intermediate", progress: 30, status: "not-started" },
  { name: "DevOps", current: "Beginner", target: "Intermediate", progress: 25, status: "not-started" },
]

const learningGoals = [
  {
    id: 1,
    title: "Advanced React Patterns",
    category: "Frontend Development",
    progress: 85,
    totalLessons: 20,
    completedLessons: 17,
    estimatedCompletion: "2 days",
  },
  {
    id: 2,
    title: "System Design Fundamentals",
    category: "Architecture",
    progress: 60,
    totalLessons: 15,
    completedLessons: 9,
    estimatedCompletion: "5 days",
  },
  {
    id: 3,
    title: "Leadership & Communication",
    category: "Soft Skills",
    progress: 40,
    totalLessons: 12,
    completedLessons: 5,
    estimatedCompletion: "1 week",
  },
  {
    id: 4,
    title: "TypeScript Mastery",
    category: "Programming",
    progress: 100,
    totalLessons: 18,
    completedLessons: 18,
    estimatedCompletion: "Completed",
  },
]

const mentorships = [
  {
    id: 1,
    mentor: "Sarah Chen",
    role: "Principal Engineer",
    focus: "System Architecture",
    sessions: 8,
    nextSession: "Tomorrow, 2:00 PM",
    status: "active",
  },
  {
    id: 2,
    mentor: "Michael Rodriguez",
    role: "Engineering Manager",
    focus: "Leadership Skills",
    sessions: 5,
    nextSession: "Friday, 10:00 AM",
    status: "active",
  },
]

const getSkillStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-secondary text-secondary-foreground">Completed</Badge>
    case "in-progress":
      return (
        <Badge variant="outline" className="border-primary text-primary">
          In Progress
        </Badge>
      )
    case "not-started":
      return <Badge variant="outline">Not Started</Badge>
    default:
      return null
  }
}

export default function ProgressTracker() {
  const [selectedTab, setSelectedTab] = useState("career-paths")

  const skillsMastered = skillsData.filter((s) => s.status === "completed").length
  const totalSkills = skillsData.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground text-balance">Career Progress Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track your professional growth, skills development, and career advancement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Career Level</CardTitle>
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Mid-Level</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Skills Mastered</CardTitle>
              <GraduationCap className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {skillsMastered}/{totalSkills}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Learning Hours</CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">47h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mentorship</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2 Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="career-paths">Career Paths</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="learning-goals">Learning Goals</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
        </TabsList>

        {/* Career Paths Tab */}
        <TabsContent value="career-paths" className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Your Career Paths</h2>
            </div>
            <p className="text-muted-foreground">Choose your direction and track progress toward your goals</p>
          </div>

          <div className="space-y-4">
            {careerPaths.map((path) => (
              <Card key={path.id} className="border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{path.title}</CardTitle>
                      <CardDescription className="mt-1">Estimated: {path.estimatedTime}</CardDescription>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">{path.progress}% Complete</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <Progress value={path.progress} className="h-2" />
                  </div>

                  {/* Key Skills Required */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Key Skills Required:</h3>
                    <div className="flex flex-wrap gap-2">
                      {path.requiredSkills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-sm">
                            {skill.name}
                          </Badge>
                          {skill.status === "completed" && (
                            <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="bg-accent/50 rounded-lg p-3 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Next Milestone:</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{path.nextMilestone}</p>
                    </div>
                  </div>

                  {/* View Detailed Roadmap */}
                  <Button variant="ghost" className="w-full justify-between group">
                    <span>View Detailed Roadmap</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Skills Development
              </CardTitle>
              <CardDescription>Track your proficiency across key technical and soft skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {skillsData.map((skill, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{skill.name}</h3>
                        {getSkillStatusBadge(skill.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Current: {skill.current}</span>
                        <span>•</span>
                        <span>Target: {skill.target}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground">{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Goals Tab */}
        <TabsContent value="learning-goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Learning Goals
              </CardTitle>
              <CardDescription>Track your course progress and learning objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningGoals.map((goal) => (
                <div key={goal.id} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal.category}</p>
                    </div>
                    {goal.progress === 100 ? (
                      <Badge className="bg-secondary text-secondary-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">{goal.progress}%</Badge>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {goal.completedLessons} of {goal.totalLessons} lessons
                      </span>
                      <span className="text-muted-foreground">Est. {goal.estimatedCompletion}</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  {goal.progress < 100 && (
                    <Button size="sm" className="w-full">
                      Continue Learning
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentorship Tab */}
        <TabsContent value="mentorship" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Mentorship Program
              </CardTitle>
              <CardDescription>Connect with experienced professionals to accelerate your growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mentorships.map((mentorship) => (
                <div key={mentorship.id} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{mentorship.mentor}</h3>
                      <p className="text-sm text-muted-foreground">{mentorship.role}</p>
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>{mentorship.focus}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{mentorship.sessions} sessions</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Next: {mentorship.nextSession}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Schedule Session
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full bg-transparent" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Find a New Mentor
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
