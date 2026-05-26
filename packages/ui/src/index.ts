export { Button, buttonVariants } from "./components/button";
export type { ButtonProps } from "./components/button";
export { Input } from "./components/input";
export type { InputProps } from "./components/input";
export { Textarea } from "./components/textarea";
export type { TextareaProps } from "./components/textarea";
export { Label } from "./components/label";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./components/card";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/dialog";
export { Badge, badgeVariants } from "./components/badge";
export type { BadgeProps } from "./components/badge";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/table";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "./components/select";
export { Switch } from "./components/switch";
export { cn } from "./lib/utils";
export { isManagedAssetPath, resolveAssetUrl } from "./lib/asset-url";
export { Toaster, toast } from "./components/toaster";
export {
  AlertTriangle, ChevronUp, ChevronDown, ChevronsUpDown, Menu, X, Moon, Sun, Copy, MoreVertical, Pencil, Trash2,
  LayoutDashboard, Users, ShieldCheck, Settings, Database,
  PanelLeftClose, PanelLeftOpen, FolderOpen, Folder, LogOut,
  // Common icons available for config.icon
  ShoppingBag, ShoppingCart, Package, Box, Tag, Tags,
  FileText, File, Files, Image, Images, Video, Music,
  Newspaper, BookOpen, Book, Bookmark, Library,
  Star, Heart, Flame, Zap, Globe, Map, MapPin,
  Calendar, Clock, Timer, Bell, Mail, MessageSquare, Phone,
  User, UserCheck, UserPlus, Briefcase, Building2,
  CreditCard, DollarSign, BarChart, TrendingUp, PieChart,
  Layers, Layout, Grid, List, Table2,
  Cpu, Code, Terminal, Wrench, Cog,
} from "lucide-react";
export type { LucideIcon } from "lucide-react";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
export const NAV_ICONS: Record<string, LucideIcon> = LucideIcons as unknown as Record<string, LucideIcon>;

// Extended shadcn components
export { Skeleton } from "./components/skeleton";
export { Separator } from "./components/separator";
export { Checkbox } from "./components/checkbox";
export { RadioGroup, RadioGroupItem } from "./components/radio-group";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/tabs";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./components/tooltip";
export { Popover, PopoverTrigger, PopoverContent } from "./components/popover";
export { Alert, AlertTitle, AlertDescription } from "./components/alert";
export { Avatar, AvatarImage, AvatarFallback } from "./components/avatar";
export { ScrollArea, ScrollBar } from "./components/scroll-area";
export { Progress } from "./components/progress";
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/accordion";
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./components/breadcrumb";
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/pagination";
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./components/sheet";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/dropdown-menu";
export { FileUpload } from "./components/file-upload";
export type { FileUploadProps } from "./components/file-upload";
export { ImageUpload } from "./components/image-upload";
export type { ImageUploadProps } from "./components/image-upload";
export { RichTextEditor } from "./components/richtext-editor";
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./components/alert-dialog";
