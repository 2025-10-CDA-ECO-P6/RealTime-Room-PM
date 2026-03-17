export function ErrorHandlers(): void {
  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason: unknown) => {
    const message =
      reason instanceof Error ? reason.message : typeof reason === "string" ? reason : JSON.stringify(reason);

    console.error("Unhandled Rejection:", message);
    process.exit(1);
  });

  process.on("warning", (warning: any) => {
    console.warn("Warning:", warning.name, "-", warning.message);
    if (warning.stack) {
      console.warn(warning.stack);
    }
  });
}
