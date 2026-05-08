import { useState } from "react";
import { useListEntries, useDeleteEntry, useUpdateEntry, getListEntriesQueryKey, getGetRecentEntriesQueryKey, getGetEntryStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Copy, Search, Calendar, ChevronDown, Check, Loader2, Hash, Edit } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Entry {
  id: number;
  userId: string;
  date: string;
  rawActivity: string;
  rewrittenEntry: string | null;
  week: number | null;
  dayOfWeek: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState("");
  
  const { data: entries, isLoading } = useListEntries(
    weekFilter ? { week: parseInt(weekFilter, 10) } : dateFilter ? { date: dateFilter } : undefined
  );
  const deleteMutation = useDeleteEntry();
  const updateMutation = useUpdateEntry();
  const queryClient = useQueryClient();

  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [editForm, setEditForm] = useState({ date: "", rawActivity: "", rewrittenEntry: "", week: "", dayOfWeek: "" });

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Entry deleted");
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetEntryStatsQueryKey() });
        },
        onError: () => {
          toast.error("Failed to delete entry");
        }
      }
    );
  };

  const handleEditClick = (entry: Entry) => {
    setEditEntry(entry);
    setEditForm({
      date: entry.date,
      rawActivity: entry.rawActivity,
      rewrittenEntry: entry.rewrittenEntry || "",
      week: entry.week?.toString() || "",
      dayOfWeek: entry.dayOfWeek || ""
    });
  };

  const handleUpdate = () => {
    if (!editEntry) return;
    updateMutation.mutate(
      { 
        id: editEntry.id, 
        data: {
          date: editForm.date,
          rawActivity: editForm.rawActivity,
          rewrittenEntry: editForm.rewrittenEntry,
          week: editForm.week ? parseInt(editForm.week, 10) : null,
          dayOfWeek: editForm.dayOfWeek
        }
      },
      {
        onSuccess: () => {
          toast.success("Entry updated");
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentEntriesQueryKey() });
          setEditEntry(null);
        },
        onError: () => toast.error("Failed to update entry")
      }
    );
  };

  const filteredEntries = entries?.filter(entry => 
    (entry.rawActivity.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (entry.rewrittenEntry && entry.rewrittenEntry.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold font-serif tracking-tight">Logbook History</h1>
          <p className="text-muted-foreground">All your past entries in one place.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search entries..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-[200px] bg-card"
            />
          </div>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Week (e.g. 4)"
              type="number"
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              className="pl-9 w-full sm:w-[120px] bg-card"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 w-full sm:w-[150px] bg-card"
              disabled={!!weekFilter} // disable date filter if week is set
            />
          </div>
          {(dateFilter || weekFilter) && (
            <Button variant="ghost" onClick={() => { setDateFilter(""); setWeekFilter(""); }} className="px-3">
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : filteredEntries && filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden border-muted/60 shadow-sm transition-all hover:shadow-md">
              <Collapsible>
                <div className="bg-card">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-muted/30">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="shrink-0 flex flex-col items-center justify-center bg-primary/5 rounded-lg p-2 min-w-[70px] border border-primary/10">
                        <span className="text-xs font-medium text-muted-foreground uppercase">{format(parseISO(entry.date), "MMM")}</span>
                        <span className="text-xl font-bold text-primary font-serif">{format(parseISO(entry.date), "dd")}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{entry.dayOfWeek || format(parseISO(entry.date), "EEEE")}</span>
                          {entry.week && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">Week {entry.week}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[300px] md:max-w-md">
                          {entry.rawActivity}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-background shadow-sm"
                        onClick={() => handleCopy(entry.id, entry.rewrittenEntry || entry.rawActivity)}
                      >
                        {copiedId === entry.id ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <Copy className="h-4 w-4 mr-2 text-muted-foreground" />}
                        {copiedId === entry.id ? "Copied" : "Copy"}
                      </Button>
                      
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)} className="text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this logbook entry? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(entry.id)}
                            >
                              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent className="animate-in slide-in-from-top-2">
                    <div className="p-5 bg-muted/10 grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original Notes</h4>
                        <div className="bg-background p-4 rounded-lg border text-sm text-foreground/80 leading-relaxed">
                          {entry.rawActivity}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Professional Version</h4>
                        <div className="bg-background p-4 rounded-lg border border-primary/20 text-sm text-foreground font-serif leading-loose shadow-sm">
                          {entry.rewrittenEntry ? (
                            entry.rewrittenEntry.split('\n').map((paragraph, i) => (
                              paragraph ? <p key={i} className="mb-2 last:mb-0">{paragraph}</p> : <br key={i} />
                            ))
                          ) : (
                            <span className="italic text-muted-foreground">No professional rewrite available.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-muted">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-1">No entries found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || dateFilter || weekFilter ? "Try adjusting your search or filters." : "You haven't written any logbook entries yet."}
            </p>
            {!searchTerm && !dateFilter && !weekFilter && (
              <Button asChild>
                <a href="/entry/new">Create First Entry</a>
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Logbook Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={editForm.date} onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Week Number</Label>
                <Input type="number" value={editForm.week} onChange={e => setEditForm(prev => ({ ...prev, week: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Input value={editForm.dayOfWeek} onChange={e => setEditForm(prev => ({ ...prev, dayOfWeek: e.target.value }))} placeholder="e.g. Monday" />
            </div>
            <div className="space-y-2">
              <Label>Raw Activity</Label>
              <Textarea 
                value={editForm.rawActivity} 
                onChange={e => setEditForm(prev => ({ ...prev, rawActivity: e.target.value }))} 
                className="h-[100px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Professional Version</Label>
              <Textarea 
                value={editForm.rewrittenEntry} 
                onChange={e => setEditForm(prev => ({ ...prev, rewrittenEntry: e.target.value }))} 
                className="h-[150px] font-serif resize-none leading-relaxed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
