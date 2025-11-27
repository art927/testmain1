import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TaskCard } from "@/components/task-card"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch open tasks (not assigned or not in production)
  const { data: openTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "open")
    .order("points_reward", { ascending: false })

  // Fetch user's assigned tasks
  const { data: myTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", user.id)
    .in("status", ["assigned", "completed"])
    .order("created_at", { ascending: false })

  const assignedTasks = myTasks?.filter((t) => t.status === "assigned") || []
  const completedTasks = myTasks?.filter((t) => t.status === "completed") || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Open Tasks</h1>
        <p className="text-muted-foreground mt-1">Self-assign tasks and earn points</p>
      </div>

      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger
            value="open"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Available Tasks ({openTasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="assigned"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            My Tasks ({assignedTasks.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-6">
          {openTasks && openTasks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {openTasks.map((task) => (
                <TaskCard key={task.id} task={task} userId={user.id} action="assign" />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">No open tasks available</p>
                <p className="text-sm mt-2">Check back later for new opportunities</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="space-y-6">
          {assignedTasks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignedTasks.map((task) => (
                <TaskCard key={task.id} task={task} userId={user.id} action="complete" />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">No assigned tasks</p>
                <p className="text-sm mt-2">Go to Available Tasks to self-assign some work</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedTasks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} userId={user.id} action="view" />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">No completed tasks yet</p>
                <p className="text-sm mt-2">Complete tasks to see them here and earn points</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
