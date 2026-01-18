'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import type { Role } from '@/lib/smartContract'
import { Crown, Code, Megaphone } from 'lucide-react'

interface RoleSwitcherProps {
  currentRole: Role
  onRoleChange: (role: Role) => void
}

const roles: { id: Role; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'founder',
    label: 'Founder',
    icon: <Crown className="w-5 h-5" />,
    description: 'Full access to all documents',
  },
  {
    id: 'engineer',
    label: 'Engineer',
    icon: <Code className="w-5 h-5" />,
    description: 'Limited technical access',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: <Megaphone className="w-5 h-5" />,
    description: 'Semantic content masking',
  },
]

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-muted-foreground">Current Role</p>
      <div className="grid grid-cols-1 gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
              currentRole === role.id
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-1">
              <div
                className={`transition-colors ${
                  currentRole === role.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {role.icon}
              </div>
              <div>
                <div className="font-semibold">{role.label}</div>
                <div className="text-xs text-muted-foreground">{role.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
