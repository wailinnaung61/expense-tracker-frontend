import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload } from "lucide-react";
import { useState } from "react";

export function ProfileSettings() {
  const [avatarUploadOpen, setAvatarUploadOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadAvatar = () => {
    if (selectedFile) {
      // In a real app, this would upload to a server

      setAvatarUploadOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={previewUrl || "/placeholder.svg?height=96&width=96"}
                  alt="User"
                />
                <AvatarFallback className="text-2xl">JD</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAvatarUploadOpen(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Change Avatar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
            </div>

            <div className="flex justify-end pt-4">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Update Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>

            <div className="flex justify-end pt-4">
              <Button>Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarUploadOpen} onOpenChange={setAvatarUploadOpen}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture. Recommended size: 400x400px
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={previewUrl || "/placeholder.svg?height=128&width=128"}
                alt="Preview"
              />
              <AvatarFallback className="text-3xl">JD</AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <Label htmlFor="avatar-upload">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF (max 5MB)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAvatarUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUploadAvatar} disabled={!selectedFile}>
              Upload Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
