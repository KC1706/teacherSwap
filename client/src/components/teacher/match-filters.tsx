import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subjects } from "@/lib/districts";

interface MatchFiltersProps {
  filters: {
    matchType: string;
    maxDistance: string;
    subject: string;
  };
  onFilterChange: (key: string, value: string) => void;
  resultCount: number;
}

export function MatchFilters({ filters, onFilterChange, resultCount }: MatchFiltersProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Show:</span>
              <Select value={filters.matchType} onValueChange={(value) => onFilterChange('matchType', value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Matches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matches</SelectItem>
                  <SelectItem value="perfect">Perfect Matches</SelectItem>
                  <SelectItem value="nearby">Nearby Teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Distance:</span>
              <Select value={filters.maxDistance} onValueChange={(value) => onFilterChange('maxDistance', value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Distances" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Distances</SelectItem>
                  <SelectItem value="25">Within 25 km</SelectItem>
                  <SelectItem value="50">Within 50 km</SelectItem>
                  <SelectItem value="75">Within 75 km</SelectItem>
                  <SelectItem value="100">Within 100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Subject:</span>
              <Select value={filters.subject} onValueChange={(value) => onFilterChange('subject', value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {resultCount} teacher{resultCount !== 1 ? 's' : ''} found
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
