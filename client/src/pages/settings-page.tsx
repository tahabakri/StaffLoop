import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { QrCode, AlertCircle, CheckCircle2, X, UserPlus, AlertTriangle } from "lucide-react";
import { TeamMembersTable, TeamMember, TeamMemberRole } from "@/components/team/TeamMembersTable";
import { InviteTeamMemberModal } from "@/components/team/InviteTeamMemberModal";

// Available industries for dropdown
const INDUSTRIES = [
  "Event Management",
  "Hospitality",
  "Corporate",
  "Education",
  "Entertainment",
  "Sports",
  "Government",
  "Non-profit",
  "Retail",
  "Technology",
  "Other"
];

// Available timezones for dropdown (common ones)
const TIMEZONES = [
  { value: "GMT", label: "(GMT+00:00) Greenwich Mean Time" },
  { value: "UTC", label: "(UTC+00:00) Universal Coordinated Time" },
  { value: "ECT", label: "(GMT+01:00) European Central Time" },
  { value: "EET", label: "(GMT+02:00) Eastern European Time" },
  { value: "ART", label: "(GMT+02:00) Egypt Standard Time" },
  { value: "EAT", label: "(GMT+03:00) Eastern African Time" },
  { value: "GST", label: "(GMT+04:00) Gulf Standard Time" },
  { value: "IST", label: "(GMT+05:30) India Standard Time" },
  { value: "CST", label: "(GMT+08:00) China Standard Time" },
  { value: "JST", label: "(GMT+09:00) Japan Standard Time" },
  { value: "AEST", label: "(GMT+10:00) Australian Eastern Standard Time" },
  { value: "NZST", label: "(GMT+12:00) New Zealand Standard Time" },
  { value: "EST", label: "(GMT-05:00) Eastern Standard Time" },
  { value: "CST", label: "(GMT-06:00) Central Standard Time" },
  { value: "MST", label: "(GMT-07:00) Mountain Standard Time" },
  { value: "PST", label: "(GMT-08:00) Pacific Standard Time" },
];

// Mock team members data for initial display
// In a real implementation, this would come from an API call
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Fatima Al Marzooqi",
    email: "fatima@example.com",
    role: "owner",
    status: "active",
    isCurrentUser: true
  },
  {
    id: "2",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    role: "admin",
    status: "active"
  },
  {
    id: "3",
    name: "Sara Khan",
    email: "sara@example.com",
    role: "event_manager",
    status: "active"
  },
  {
    id: "4", 
    name: "Mohammed Ali",
    email: "mohammed@example.com",
    role: "staffing_coordinator",
    status: "invitation_sent"
  }
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState<string>(user?.companyName || "");
  const [industry, setIndustry] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("GST"); // Default to Gulf Standard Time
  const [profileChanged, setProfileChanged] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  
  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // When any profile field changes, set profileChanged to true
  useEffect(() => {
    setProfileChanged(true);
  }, [companyName, industry, timezone, photoFile]);

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile save
  const handleProfileSave = () => {
    // Here you would typically make an API call to save the profile changes
    toast({
      title: "Profile updated",
      description: "Your profile settings have been saved successfully.",
    });
    setProfileChanged(false);
  };

  // Handle password update
  const handlePasswordUpdate = () => {
    // Here you would typically make an API call to update the password
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });
    setPasswordChanged(false);
  };

  // Handle 2FA toggle
  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    if (checked) {
      setShowTwoFactorSetup(true);
    }
  };
  
  // Team Management Handlers
  const handleEditRole = (memberId: string, newRole: TeamMemberRole) => {
    // In a real implementation, this would make an API call to update the role
    console.log(`Updating role for member ${memberId} to ${newRole}`);
    
    // For now, just update the local state to simulate API response
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole } 
          : member
      )
    );
  };
  
  const handleRemoveMember = (memberId: string) => {
    // In a real implementation, this would make an API call to remove the member
    console.log(`Removing member ${memberId}`);
    
    // For now, just update the local state to simulate API response
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };
  
  const handleResendInvitation = (memberId: string) => {
    // In a real implementation, this would make an API call to resend the invitation
    console.log(`Resending invitation to member ${memberId}`);
    
    // For now, just show a toast to simulate success
    toast({
      title: "Invitation resent",
      description: "The invitation has been resent successfully.",
    });
  };
  
  const handleInviteTeamMember = async (data: { email: string; name?: string; role: string; }) => {
    // In a real implementation, this would make an API call to send the invitation
    console.log("Inviting new team member:", data);
    
    // Simulate API call with a delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Add the new member to the local state to simulate API response
        const newMember: TeamMember = {
          id: `temp-${Date.now()}`, // In real app, this would be assigned by the server
          name: data.name || data.email.split('@')[0], // Use name if provided, otherwise use email username
          email: data.email,
          role: data.role as TeamMemberRole,
          status: "invitation_sent"
        };
        
        setTeamMembers(prev => [...prev, newMember]);
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="w-24 h-24">
                    {photoPreview ? (
                      <AvatarImage src={photoPreview} alt={user?.name || ""} />
                    ) : user?.profileImage && typeof user.profileImage === "string" ? (
                      <AvatarImage src={user.profileImage} alt={user?.name || ""} />
                    ) : null}
                    <AvatarFallback className="text-2xl">{getInitials(user?.name || "")}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-2">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                        Change Photo
                      </div>
                      <input 
                        id="photo-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoChange}
                      />
                    </label>
                    {photoPreview && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview("");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4 flex-1">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name} />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input 
                      id="company-name" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company or organization name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select your time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      This will be used for displaying event times and scheduling notifications.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} disabled />
                    <p className="text-sm text-muted-foreground">Your email is used for login and cannot be changed.</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue={user?.phone} />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleProfileSave} 
                  disabled={!profileChanged}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    onChange={() => setPasswordChanged(true)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    onChange={() => setPasswordChanged(true)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    onChange={() => setPasswordChanged(true)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handlePasswordUpdate}
                  disabled={!passwordChanged}
                >
                  Update Password
                </Button>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                
                <div className="flex justify-between items-center mb-4">
                  <Label htmlFor="two-factor" className="cursor-pointer">
                    {twoFactorEnabled ? "Two-Factor Authentication is Enabled" : "Enable Two-Factor Authentication"}
                  </Label>
                  <Switch 
                    id="two-factor" 
                    checked={twoFactorEnabled}
                    onCheckedChange={handleTwoFactorToggle}
                  />
                </div>
                
                {twoFactorEnabled && (
                  <div className="rounded-lg bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Your account is more secure with 2FA enabled</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      With 2FA enabled, you'll need to enter a verification code from your authenticator app when logging in.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowTwoFactorSetup(true)}
                      >
                        View Setup Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          toast({
                            title: "Recovery codes generated",
                            description: "Save these codes in a safe place. They can be used if you lose access to your authenticator app.",
                          });
                        }}
                      >
                        View Recovery Codes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, all of your events and staff data will be permanently removed. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    toast({
                      title: "Account deletion requested",
                      description: "Please check your email to confirm account deletion.",
                    });
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage your notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Staff Check-in Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified when staff check in</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Late Staff Notifications</h4>
                    <p className="text-sm text-gray-500">Get notified when staff are late</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Marketing Updates</h4>
                    <p className="text-sm text-gray-500">Receive new feature announcements</p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => {
                  toast({
                    title: "Preferences saved",
                    description: "Your notification preferences have been saved successfully.",
                  });
                }}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage your organization team members and their roles
                </CardDescription>
              </div>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading team members...</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-4 mb-6">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Team Access Considerations</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Team members you add here will have access based on their assigned role. 
                          They will receive an email invitation to join your organization.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <TeamMembersTable 
                    teamMembers={teamMembers}
                    onEditRole={handleEditRole}
                    onRemoveMember={handleRemoveMember}
                    onResendInvitation={handleResendInvitation}
                    currentUserId="1" // Replace with actual user ID in a real implementation
                    isOwner={true} // Replace with role check in a real implementation
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 2FA Setup Dialog */}
      <Dialog open={showTwoFactorSetup} onOpenChange={setShowTwoFactorSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app to set up two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="bg-white p-2 rounded-lg mb-4">
              <QrCode className="h-48 w-48" />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              If you can't scan the QR code, you can manually enter this setup key in your authenticator app:
            </p>
            <div className="bg-gray-100 p-2 rounded-lg w-full text-center mb-6">
              <code className="text-sm font-mono">EXAMPLESETUPKEY123456</code>
            </div>
            <div className="grid gap-4 w-full">
              <Label htmlFor="verification-code">Enter verification code from your app</Label>
              <Input id="verification-code" placeholder="e.g. 123456" />
            </div>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setShowTwoFactorSetup(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowTwoFactorSetup(false);
              toast({
                title: "Two-factor authentication enabled",
                description: "Your account is now more secure with 2FA.",
              });
            }}>
              Verify and Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Invite Team Member Modal */}
      <InviteTeamMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteTeamMember}
      />
    </div>
  );
}

