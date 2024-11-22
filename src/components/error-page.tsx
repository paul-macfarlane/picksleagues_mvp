import NextLink from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

export default function ErrorPage({
  title,
  description,
  content,
  buttonProps,
}: {
  title: string;
  description?: string;
  content?: React.ReactNode;
  buttonProps?: {
    link: string;
    text: string;
  };
}) {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-primary/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {title}
          </CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        {content ? <CardContent>{content}</CardContent> : <></>}

        <CardFooter className="flex justify-center">
          <Button className="w-full" asChild>
            <NextLink href={buttonProps?.link ?? "/"}>
              {buttonProps?.text ?? "Back to Home"}
            </NextLink>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
