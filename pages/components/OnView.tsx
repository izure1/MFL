'use client'

import React from 'react'
import { type IntersectionOptions, useInView } from 'react-intersection-observer'

interface OnViewProps extends React.ComponentPropsWithoutRef<'div'> {
  viewOption?: IntersectionOptions
  onOutClass: [string, string]
}

const OnView: React.FC<OnViewProps> = ({
  viewOption,
  onOutClass,
  children,
}) => {
  const [viewRef, isView] = useInView(viewOption)
  const [on, out] = onOutClass
  return (
    <div
      ref={viewRef}
      className={isView ? on : out}
    >
      {children}
    </div>
  )
}

export default OnView
