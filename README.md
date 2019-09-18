# day-start-interval

## Error handling

As with `setInterval`, if `func` throws, that exception will not be caught. You are responsible
for adding your own `try-catch` inside `func` if needed. If `func` throws, this library does not
make any guarantees about whether the interval will continue to run.
