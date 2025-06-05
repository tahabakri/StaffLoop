import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImportStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Template headers for staff CSV
const CSV_TEMPLATE_HEADERS = ["Full Name", "WhatsApp Number", "Email", "Default Role"];

// Required fields for validation
const REQUIRED_FIELDS = ["Full Name", "WhatsApp Number"];

export function ImportStaffModal({ open, onOpenChange }: ImportStaffModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Stage management
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);
  
  // File handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  // Column mapping
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  // Import progress
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{
    successful: number;
    failed: number;
    total: number;
  }>({ successful: 0, failed: 0, total: 0 });
  
  // Reset the modal state when it closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when modal closes
      setCurrentStage(1);
      setSelectedFile(null);
      setCsvHeaders([]);
      setPreviewData([]);
      setColumnMapping({});
      setImportProgress(0);
      setImportSummary({ successful: 0, failed: 0, total: 0 });
    }
    onOpenChange(open);
  };
  
  // Handle CSV template download
  const handleDownloadTemplate = () => {
    // Create CSV content
    const header = CSV_TEMPLATE_HEADERS.join(",");
    const exampleRow = [
      "John Doe",
      "+971501234567",
      "john.doe@example.com",
      "Security"
    ].join(",");
    
    const csvContent = `${header}\n${exampleRow}`;
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "The CSV template has been downloaded to your device.",
    });
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Read file to extract headers
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(header => header.trim());
        setCsvHeaders(headers);
        
        // Auto-map columns based on similar names
        const mapping: Record<string, string> = {};
        CSV_TEMPLATE_HEADERS.forEach(targetHeader => {
          const matchingHeader = headers.find(h => 
            h.toLowerCase().includes(targetHeader.toLowerCase()) || 
            targetHeader.toLowerCase().includes(h.toLowerCase())
          );
          if (matchingHeader) {
            mapping[targetHeader] = matchingHeader;
          }
        });
        setColumnMapping(mapping);
        
        // Generate preview data (first 5 rows)
        const previewRows = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(value => value.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as Record<string, string>);
        });
        setPreviewData(previewRows);
      }
    };
    reader.readAsText(file);
  };
  
  // Handle column mapping changes
  const handleMappingChange = (targetField: string, sourceField: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [targetField]: sourceField
    }));
  };
  
  // Validate a staff row
  const validateStaffRow = (row: Record<string, string>, mapping: Record<string, string>) => {
    const errors: string[] = [];
    
    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      const sourceField = mapping[field];
      if (!sourceField || !row[sourceField]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Validate WhatsApp number format (simple validation)
    const whatsappField = mapping["WhatsApp Number"];
    if (whatsappField && row[whatsappField]) {
      const phone = row[whatsappField];
      if (!phone.startsWith('+') || phone.length < 10) {
        errors.push("WhatsApp number should include country code (e.g., +971...)");
      }
    }
    
    return errors;
  };
  
  // Check if mapping is complete
  const isMappingComplete = () => {
    return REQUIRED_FIELDS.every(field => columnMapping[field] && columnMapping[field].length > 0);
  };
  
  // Process import
  const processImport = () => {
    setCurrentStage(4);
    
    // Simulate progress (in a real app, this would be API calls)
    const totalRows = previewData.length;
    setImportSummary({ successful: 0, failed: 0, total: totalRows });
    
    let processed = 0;
    const interval = setInterval(() => {
      processed++;
      setImportProgress(Math.floor((processed / totalRows) * 100));
      
      // Randomly succeed or fail for demo
      const isSuccess = Math.random() > 0.2;
      setImportSummary(prev => ({
        ...prev,
        successful: isSuccess ? prev.successful + 1 : prev.successful,
        failed: isSuccess ? prev.failed : prev.failed + 1
      }));
      
      if (processed >= totalRows) {
        clearInterval(interval);
      }
    }, 500);
  };
  
  // Proceed to next stage
  const goToNextStage = () => {
    if (currentStage < 4) {
      setCurrentStage((prev) => (prev + 1) as any);
    }
  };
  
  // Go back to previous stage
  const goToPreviousStage = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => (prev - 1) as any);
    }
  };
  
  // Render different content based on current stage
  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Import Your Staff List</DialogTitle>
              <DialogDescription>
                Upload a CSV file with your staff details to add them to StaffLoop
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <Card className="p-4 bg-blue-50">
                <h3 className="text-lg font-medium mb-2">1. Download Our CSV Template</h3>
                <p className="text-sm mb-3">
                  Get started by downloading our template. This ensures your data matches our system fields. 
                  Required fields are Full Name and WhatsApp Number.
                </p>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </Card>
              
              <Card className="p-4 bg-blue-50">
                <h3 className="text-lg font-medium mb-2">2. Prepare Your CSV File</h3>
                <p className="text-sm">
                  Fill in your staff details. Each staff member should be on a new row. 
                  Ensure WhatsApp numbers include the country code.
                </p>
              </Card>
              
              <Card className="p-4 bg-blue-50">
                <h3 className="text-lg font-medium mb-2">3. Upload Your File</h3>
                <div className="mt-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only CSV files are supported
                  </p>
                </div>
              </Card>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={goToNextStage} 
                disabled={!selectedFile}
                className="w-full sm:w-auto"
              >
                Next - Map Columns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        );
        
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Map Your CSV Columns</DialogTitle>
              <DialogDescription>
                Match the columns from your uploaded CSV to StaffLoop's required fields
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <p className="text-sm">
                We've attempted to auto-map your columns based on their names. 
                Please review and adjust as needed. <span className="text-red-500 font-medium">*</span> indicates required fields.
              </p>
              
              <div className="space-y-3">
                {CSV_TEMPLATE_HEADERS.map(field => (
                  <div key={field} className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {field}
                        {REQUIRED_FIELDS.includes(field) && (
                          <span className="text-red-500 ml-0.5">*</span>
                        )}
                      </span>
                    </div>
                    <Select
                      value={columnMapping[field] || ""}
                      onValueChange={(value) => handleMappingChange(field, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Not mapped</SelectItem>
                        {csvHeaders.map(header => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={goToPreviousStage}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={goToNextStage} 
                disabled={!isMappingComplete()}
              >
                Preview Data
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        );
        
      case 3:
        // Calculate validation results
        const rowValidations = previewData.map(row => 
          validateStaffRow(row, columnMapping)
        );
        
        const validRows = rowValidations.filter(errors => errors.length === 0).length;
        const invalidRows = rowValidations.filter(errors => errors.length > 0).length;
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>Preview Your Import</DialogTitle>
              <DialogDescription>
                Review the first {previewData.length} rows of your data before importing
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{validRows}</span> rows ready for import, 
                  <span className="font-medium text-red-500 ml-1">{invalidRows}</span> rows with errors
                </div>
                
                {invalidRows > 0 && (
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Error Report
                  </Button>
                )}
              </div>
              
              <div className="border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      {CSV_TEMPLATE_HEADERS.map(header => (
                        <TableHead key={header}>
                          {header}
                          {REQUIRED_FIELDS.includes(header) && (
                            <span className="text-red-500">*</span>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => {
                      const errors = rowValidations[index];
                      const isValid = errors.length === 0;
                      
                      return (
                        <TableRow key={index} className={isValid ? "" : "bg-red-50"}>
                          <TableCell>
                            {isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          {CSV_TEMPLATE_HEADERS.map(header => {
                            const sourceField = columnMapping[header];
                            return (
                              <TableCell key={header}>
                                {sourceField ? row[sourceField] || '-' : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {invalidRows > 0 && (
                <div className="bg-red-50 p-3 rounded-md text-sm text-red-800">
                  <p className="font-medium">Errors found:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {rowValidations.map((errors, index) => (
                      errors.length > 0 && (
                        <li key={index}>
                          Row {index + 1}: {errors.join(', ')}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={goToPreviousStage}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={processImport}
                disabled={validRows === 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Staff
              </Button>
            </DialogFooter>
          </>
        );
        
      case 4:
        const isImportComplete = importProgress === 100;
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>
                {isImportComplete ? "Import Complete" : "Importing Staff..."}
              </DialogTitle>
              <DialogDescription>
                {isImportComplete 
                  ? "Your staff have been imported to StaffLoop" 
                  : "Please wait while we process your staff data"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-6">
              {!isImportComplete && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}
              
              {isImportComplete && (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Import Successful</h3>
                  <p className="text-gray-500 mb-6">
                    {importSummary.successful} staff members successfully imported.
                    {importSummary.failed > 0 && ` ${importSummary.failed} failed.`}
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Card className="p-4 flex-1 bg-green-50 border-green-200">
                      <p className="text-xs text-green-700 mb-1">Successfully Imported</p>
                      <p className="text-2xl font-bold text-green-700">
                        {importSummary.successful}
                      </p>
                    </Card>
                    
                    {importSummary.failed > 0 && (
                      <Card className="p-4 flex-1 bg-red-50 border-red-200">
                        <p className="text-xs text-red-700 mb-1">Failed to Import</p>
                        <p className="text-2xl font-bold text-red-700">
                          {importSummary.failed}
                        </p>
                      </Card>
                    )}
                  </div>
                  
                  {importSummary.failed > 0 && (
                    <Button variant="outline" className="mt-4">
                      <Download className="mr-2 h-4 w-4" />
                      Download Error Report
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              {isImportComplete ? (
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              ) : (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </Button>
              )}
            </DialogFooter>
          </>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {renderStageContent()}
      </DialogContent>
    </Dialog>
  );
} 