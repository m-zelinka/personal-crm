import {
  ChevronRightIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/16/solid'
import { Slot } from '@radix-ui/react-slot'
import {
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { cx } from '~/utils/misc'

export const Breadcrumb = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<'nav'> & { separator?: ReactNode }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = 'Breadcrumb'

export const BreadcrumbList = forwardRef<
  HTMLOListElement,
  ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cx(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      className,
    )}
    {...props}
  />
))
BreadcrumbList.displayName = 'BreadcrumbList'

export const BreadcrumbItem = forwardRef<
  HTMLLIElement,
  ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cx('inline-flex items-center gap-1.5', className)}
    {...props}
  />
))
BreadcrumbItem.displayName = 'BreadcrumbItem'

export const BreadcrumbLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<'a'> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'

  return (
    <Comp
      ref={ref}
      className={cx('transition-colors hover:text-foreground', className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = 'BreadcrumbLink'

export const BreadcrumbPage = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    className={cx('font-normal text-foreground', className)}
    aria-disabled="true"
    aria-current="page"
    {...props}
  />
))
BreadcrumbPage.displayName = 'BreadcrumbPage'

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      role="presentation"
      className={cx('[&>svg]:size-3.5', className)}
      aria-hidden
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

export function BreadcrumbEllipsis({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      role="presentation"
      className={cx('flex size-9 items-center justify-center', className)}
      aria-hidden
      {...props}
    >
      <EllipsisVerticalIcon className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis'
