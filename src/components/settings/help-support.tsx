import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function HelpSupport() {
  return (
    <div className="space-y-6">
      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Reach out for help or submit a request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account Issues</SelectItem>
                  <SelectItem value="billing">Billing Questions</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or feedback..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">
                Attachment{" "}
                <span className="text-muted-foreground text-sm">
                  (optional)
                </span>
              </Label>
              <Input id="attachment" type="file" />
            </div>

            <div className="pt-2 text-end">
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="hover:no-underline hover:text-primary/70 text-primary">
                How do I add a new transaction?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {`Click the "+" button in the bottom right corner or go to the
                Expenses page and select "Add Transaction".`}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger className="hover:no-underline hover:text-primary/70 text-primary">
                How do I create a budget?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {`Go to the Budget Planning page and click "Add Category" to set
                up a new budget and define spending limits.`}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger className="hover:no-underline hover:text-primary/70 text-primary">
                Can I export my financial data?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {` Yes, export your data as a CSV file from the Dashboard using the
                "Export Data" button or via Settings → Data & Privacy.`}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4">
              <AccordionTrigger className="hover:no-underline hover:text-primary/70 text-primary">
                How do I change my password?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {`Go to Settings → Profile, scroll to the Password section, and
                enter your current and new passwords to update.`}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
