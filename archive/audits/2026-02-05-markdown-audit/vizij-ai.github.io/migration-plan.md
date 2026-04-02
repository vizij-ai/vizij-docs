<!-- Archived from vizij-ai.github.io/migration-plan.md on 2026-02-05 -->
<!-- Reason: superseded or historical planning note; preserved for reference. -->

# Migration Plan: Schema Restructuring Implementation

## Overview

This document outlines the migration strategy for implementing the new schema structure that separates people from organizations and uses reference-based relationships throughout the content system.

## Current Issues to Resolve

### 1. TypeScript Errors in Data Functions
- **hardware.ts**: References to removed `institutions` field (7 errors)
- **software.ts**: References to removed `institutions` field (5 errors)
- **events.ts**: Type mismatches with new schema (4 errors)
- **studies.astro**: Author structure incompatibility (2 errors)

### 2. Component Updates Required
- **DetailLayout.astro**: Add contributor/organization display
- **New Component**: PersonHoverCard for displaying person bios
- **New Component**: ContributorChip for person/org display

## Implementation Plan

## Phase 1: Create New Components (Priority: High)

### 1.1 Install Radix UI Dependencies
First, install the required Radix UI packages:

```bash
npm install @radix-ui/react-hover-card @radix-ui/react-avatar
```

### 1.2 PersonHoverCard Component (React)
Create `/src/components/PersonHoverCard.tsx`:

```tsx
import React from 'react';
import * as HoverCard from '@radix-ui/react-hover-card';
import * as Avatar from '@radix-ui/react-avatar';
import { Icon } from '@iconify/react';
import type { CollectionEntry } from 'astro:content';

interface PersonHoverCardProps {
  person: CollectionEntry<'people'>['data'] | null;
  personId: string;
  role?: string;
  currentAffiliation?: {
    partnerId: string;
    partnerName?: string;
    role: string;
  };
}

export function PersonHoverCard({ 
  person, 
  personId, 
  role,
  currentAffiliation 
}: PersonHoverCardProps) {
  if (!person) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
        <Icon icon="solar:user-circle-bold" className="w-6 h-6" />
        <span className="text-sm text-gray-500">Unknown Person</span>
      </span>
    );
  }

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-special-lighter rounded-full border-2 border-accent-one/40 hover:border-accent-two transition-all cursor-pointer">
          <Avatar.Root className="w-6 h-6">
            <Avatar.Image 
              src={person.avatar?.src || ''} 
              alt={person.name}
              className="w-full h-full rounded-full object-cover"
            />
            <Avatar.Fallback className="w-full h-full rounded-full bg-accent-one/20 flex items-center justify-center">
              <Icon icon="solar:user-circle-bold" className="w-4 h-4" />
            </Avatar.Fallback>
          </Avatar.Root>
          <span className="text-sm font-medium">{person.displayName || person.name}</span>
          {role && <span className="text-xs text-color-600 dark:text-color-400">({role})</span>}
        </button>
      </HoverCard.Trigger>
      
      <HoverCard.Portal>
        <HoverCard.Content 
          className="w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-accent-one/20"
          sideOffset={5}
        >
          <div className="flex items-start gap-4">
            <Avatar.Root className="w-16 h-16 flex-shrink-0">
              <Avatar.Image 
                src={person.avatar?.src || ''} 
                alt={person.name}
                className="w-full h-full rounded-full object-cover"
              />
              <Avatar.Fallback className="w-full h-full rounded-full bg-accent-one/20 flex items-center justify-center">
                <Icon icon="solar:user-circle-bold" className="w-10 h-10" />
              </Avatar.Fallback>
            </Avatar.Root>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base">
                {person.displayName || person.name}
                {person.pronouns && (
                  <span className="ml-2 text-xs text-gray-500">({person.pronouns})</span>
                )}
              </h4>
              {person.title && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{person.title}</p>
              )}
              {currentAffiliation && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {currentAffiliation.role} at {currentAffiliation.partnerName || currentAffiliation.partnerId}
                </p>
              )}
            </div>
          </div>
          
          {person.bio && (
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{person.bio}</p>
          )}
          
          {person.expertise && person.expertise.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold mb-1">Expertise:</p>
              <div className="flex flex-wrap gap-1">
                {person.expertise.map((skill) => (
                  <span key={skill} className="text-xs px-2 py-0.5 bg-accent-two/10 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {person.links?.github && (
              <a 
                href={`https://github.com/${person.links.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline flex items-center gap-1"
              >
                <Icon icon="mdi:github" className="w-3 h-3" />
                GitHub
              </a>
            )}
            {person.orcid && (
              <a 
                href={`https://orcid.org/${person.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline flex items-center gap-1"
              >
                <Icon icon="simple-icons:orcid" className="w-3 h-3" />
                ORCID
              </a>
            )}
            {person.website && (
              <a 
                href={person.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline flex items-center gap-1"
              >
                <Icon icon="solar:link-bold" className="w-3 h-3" />
                Website
              </a>
            )}
          </div>
          
          <HoverCard.Arrow className="fill-white dark:fill-gray-800" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
```

### 1.3 PersonHoverCard Wrapper (Astro)
Create `/src/components/PersonHoverCardWrapper.astro`:

```astro
---
import { getEntry } from "astro:content";
import { PersonHoverCard } from "./PersonHoverCard";

interface Props {
  personId: string;
  role?: string;
}

const { personId, role } = Astro.props;
const person = await getEntry("people", personId);

// Get current affiliation details if available
let currentAffiliation = null;
if (person?.data.affiliations) {
  const current = person.data.affiliations.find(a => a.current);
  if (current) {
    const partner = await getEntry("partners", current.partnerId);
    currentAffiliation = {
      ...current,
      partnerName: partner?.data.name || current.partnerId
    };
  }
}
---

<PersonHoverCard 
  client:load
  person={person?.data || null}
  personId={personId}
  role={role}
  currentAffiliation={currentAffiliation}
/>
```

### 1.4 OrganizationChip Component
Create `/src/components/OrganizationChip.astro`:

```astro
---
import { getEntry } from "astro:content";
import { Icon } from "astro-icon/components";

interface Props {
  partnerId: string;
  role?: string;
}

const { partnerId, role } = Astro.props;
const partner = await getEntry("partners", partnerId);

if (!partner) return null;

const { data } = partner;
---

<a href={`/partners/${partnerId}`} class="org-chip">
  {data.logo ? (
    <img src={data.logo} alt={data.name} class="logo" />
  ) : (
    <Icon name="solar:buildings-line-duotone" class="logo-icon" />
  )}
  <span>{data.shortName || data.name}</span>
  {role && <span class="role">{role}</span>}
</a>

<style>
  .org-chip {
    @apply inline-flex items-center gap-2 px-3 py-1.5 
           bg-special-lighter rounded-full border-2 
           border-accent-one/40 hover:border-accent-two 
           transition-all no-underline;
  }
  
  .logo, .logo-icon {
    @apply w-6 h-6 rounded;
  }
  
  .role {
    @apply text-xs text-color-600 dark:text-color-400;
  }
</style>
```

## Phase 2: Update Data Functions (Priority: High)

### 2.1 Fix hardware.ts

Replace references to `institutions` with new fields:

```typescript
// Old code
const institutions = hardware.data.institutions || [];
institutions.forEach((inst: string) => {
  // ...
});

// New code
const leadOrg = hardware.data.leadOrganization;
const supportingOrgs = hardware.data.supportingOrganizations || [];
const allOrgs = leadOrg ? [leadOrg, ...supportingOrgs] : supportingOrgs;
allOrgs.forEach((orgId: string) => {
  // ...
});
```

### 2.2 Fix software.ts

Similar updates replacing `institutions` with organization references:

```typescript
// Update getInstitutionSoftware function
export async function getOrganizationSoftware(orgId: string) {
  const allSoftware = await getAllSoftware();
  return allSoftware.filter((sw) => {
    const isLead = sw.data.leadOrganization === orgId;
    const isSupporting = sw.data.supportingOrganizations?.includes(orgId);
    return isLead || isSupporting;
  });
}
```

### 2.3 Update events.ts

Fix organizer and speaker references:

```typescript
// Update to use new reference structure
const organizers = event.data.organizers || [];
const speakers = event.data.speakers || [];
```

## Phase 3: Update DetailLayout.astro (Priority: High)

### 3.1 Add Contributors Section

Update DetailLayout.astro to display contributors at the top:

```astro
---
import PersonHoverCardWrapper from "./PersonHoverCardWrapper.astro";
import OrganizationChip from "./OrganizationChip.astro";
import { getEntry } from "astro:content";

// ... existing props ...

// Get organization details
const leadOrg = data.leadOrganization ? 
  await getEntry("partners", data.leadOrganization) : null;
const supportingOrgs = data.supportingOrganizations ? 
  await Promise.all(data.supportingOrganizations.map(id => 
    getEntry("partners", id)
  )) : [];

// Get contributors
const contributors = data.contributors || [];
const peopleContributors = contributors.filter(c => c.type === "person");
const orgContributors = contributors.filter(c => c.type === "organization");
---

<!-- Add after header/title section -->
<section class="contributors-section mb-8">
  {/* Organizations */}
  {(leadOrg || supportingOrgs.length > 0) && (
    <div class="organizations mb-4">
      <h3 class="text-sm font-semibold mb-2">Organizations</h3>
      <div class="flex flex-wrap gap-2">
        {leadOrg && (
          <OrganizationChip partnerId={leadOrg.id} role="Lead Organization" />
        )}
        {supportingOrgs.map(org => (
          <OrganizationChip partnerId={org.id} role="Supporting Organization" />
        ))}
      </div>
    </div>
  )}
  
  {/* People Contributors */}
  {peopleContributors.length > 0 && (
    <div class="people-contributors">
      <h3 class="text-sm font-semibold mb-2">Contributors</h3>
      <div class="flex flex-wrap gap-2">
        {peopleContributors.map(contributor => (
          <PersonHoverCardWrapper 
            personId={contributor.id} 
            role={contributor.role}
          />
        ))}
      </div>
    </div>
  )}
  
  {/* Organization Contributors */}
  {orgContributors.length > 0 && (
    <div class="org-contributors mt-4">
      <h3 class="text-sm font-semibold mb-2">Contributing Organizations</h3>
      <div class="flex flex-wrap gap-2">
        {orgContributors.map(contributor => (
          <OrganizationChip 
            partnerId={contributor.id} 
            role={contributor.role}
          />
        ))}
      </div>
    </div>
  )}
</section>
```

## Phase 4: Update Studies Page (Priority: Medium)

### 4.1 Fix Author Display

Update studies.astro to handle new author reference structure:

```astro
// In StudyCard component or inline
{study.data.authors.map(async (author) => {
  const person = await getEntry("people", author.personId);
  return person?.data.name || "Unknown Author";
}).join(", ")}
```

### 4.2 Create Author List Component

Create `/src/components/AuthorList.astro`:

```astro
---
import { getEntry } from "astro:content";
import PersonHoverCardWrapper from "./PersonHoverCardWrapper.astro";

interface Props {
  authors: Array<{
    personId: string;
    order: number;
    corresponding?: boolean;
    equalContribution?: boolean;
  }>;
}

const { authors } = Astro.props;

// Sort by order and fetch person data
const sortedAuthors = authors.sort((a, b) => a.order - b.order);
const authorData = await Promise.all(
  sortedAuthors.map(async (author) => ({
    ...author,
    person: await getEntry("people", author.personId)
  }))
);
---

<div class="author-list flex flex-wrap gap-2">
  {authorData.map((author, index) => (
    <>
      <PersonHoverCardWrapper 
        personId={author.personId} 
        role={author.corresponding ? "Corresponding Author" : undefined}
      />
      {index < authorData.length - 1 && <span>,</span>}
    </>
  ))}
</div>
```

## Phase 5: Create Helper Functions (Priority: Medium)

### 5.1 People Data Helper

Create `/src/data/people.ts`:

```typescript
import { getCollection, getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";

export async function getAllPeople() {
  return await getCollection("people", ({ data }) => {
    return import.meta.env.PROD ? data.visibility === "public" : true;
  });
}

export async function getPerson(id: string) {
  return await getEntry("people", id);
}

export async function getPeopleByOrganization(partnerId: string) {
  const allPeople = await getAllPeople();
  return allPeople.filter(person => 
    person.data.affiliations?.some(aff => 
      aff.partnerId === partnerId && aff.current
    )
  );
}

export async function getPersonWithAffiliations(personId: string) {
  const person = await getPerson(personId);
  if (!person) return null;
  
  const affiliations = await Promise.all(
    (person.data.affiliations || []).map(async (aff) => ({
      ...aff,
      organization: await getEntry("partners", aff.partnerId)
    }))
  );
  
  return {
    ...person,
    affiliations
  };
}
```

## Phase 6: Sample Content Migration (Priority: Low)

### 6.1 Create Sample Person Entry

Create `/src/content/people/jane-smith.mdx`:

```yaml
---
id: "jane-smith"
name: "Jane Smith"
displayName: "Dr. Jane Smith"
pronouns: "she/her"
title: "Associate Professor of Computer Science"
bio: "Dr. Jane Smith is a leading researcher in human-robot interaction, focusing on social robotics and assistive technologies."
expertise: ["Human-Robot Interaction", "Social Robotics", "Machine Learning"]
affiliations:
  - partnerId: "george-mason-university"
    role: "Associate Professor"
    department: "Computer Science"
    current: true
    startDate: 2019-08-01
orcid: "0000-0002-1825-0097"
googleScholar: "jane-smith-gmu"
email: "jsmith@gmu.edu"
website: "https://cs.gmu.edu/~jsmith"
links:
  github: "janesmith"
  linkedin: "jane-smith-phd"
  twitter: "drjanesmith"
visibility: "public"
featured: true
lastUpdated: 2024-01-15
---
```

### 6.2 Update Existing Hardware Entry

Update hardware entry to use new contributor structure:

```yaml
# Before
maintainers: ["Jane Smith", "John Doe"]
institutions: ["George Mason University", "MIT"]

# After
contributors:
  - type: "person"
    id: "jane-smith"
    role: "Lead Developer"
    current: true
  - type: "person"
    id: "john-doe"
    role: "Maintainer"
    current: true
leadOrganization: "george-mason-university"
supportingOrganizations: ["mit"]
```

## Phase 7: Testing & Validation (Priority: High)

### 7.1 TypeScript Compilation
- [ ] Run `npm run build` to ensure no TypeScript errors
- [ ] Check all type definitions are correct

### 7.2 Content Validation
- [ ] Verify all references resolve correctly
- [ ] Check hover cards display proper information
- [ ] Test organization and person links

### 7.3 Visual Testing
- [ ] Verify contributor chips display correctly
- [ ] Test hover card positioning and animations
- [ ] Check responsive behavior on mobile

## Migration Timeline

### Week 1
- Day 1-2: Create new components (PersonHoverCard, OrganizationChip)
- Day 3-4: Fix data function TypeScript errors
- Day 5: Update DetailLayout with contributor display

### Week 2
- Day 1-2: Fix page-level TypeScript errors
- Day 3: Create helper functions for people data
- Day 4-5: Test and validate changes

### Week 3
- Day 1-3: Migrate existing content to new structure
- Day 4-5: Final testing and deployment

## Rollback Plan

If issues arise during migration:

1. **Schema Reversion**: Keep backup of original content.config.ts
2. **Content Backup**: Version control all content changes
3. **Staged Deployment**: Deploy to staging environment first
4. **Feature Flags**: Use environment variables to toggle new features

## Success Criteria

- [ ] All TypeScript errors resolved
- [ ] Hover cards functioning with person information
- [ ] Organizations properly displayed with logos/icons
- [ ] Contributors visible on all detail pages
- [ ] No broken references in production
- [ ] Page load performance maintained or improved

## Post-Migration Tasks

1. Update documentation with new schema structure
2. Create content entry guidelines for contributors
3. Build admin UI for managing people/organizations
4. Implement search functionality for people
5. Add collaboration network visualization
- This structure supports future features like collaboration graphs

## Notes

- The separation of people from organizations provides clearer data modeling
- Reference-based system eliminates data duplication
- Hover cards improve user experience by providing quick bio access
- This structure supports future features like collaboration graphs

## Implementation Status

### Completed ✅

1. **Components Created**:
   - ✅ PersonHoverCard.tsx (React component with Radix UI)
   - ✅ PersonHoverCardWrapper.astro (Astro wrapper)
   - ✅ OrganizationChip.astro (Organization display component)

2. **Data Functions Updated**:
   - ✅ hardware.ts - Fixed to use new organization fields
   - ✅ software.ts - Fixed to use new organization fields
   - ✅ events.ts - Fixed to use new reference structure
   - ✅ people.ts - Created new helper functions

3. **Pages Updated**:
   - ✅ studies.astro - Fixed to use new author structure
   - ✅ DetailLayout.astro - Added contributor/organization sections

4. **Sample Content Created**:
   - ✅ jane-smith.mdx - Sample person entry
   - ✅ john-doe.mdx - Sample person entry

### Remaining Tasks 🔧

1. **Fix Remaining TypeScript Errors**:
   - [ ] hardware.astro page errors
   - [ ] hardware/[...slug].astro page errors
   - [ ] Header.astro component error

2. **Content Migration**:
   - [ ] Migrate existing hardware entries to use new contributor structure
   - [ ] Migrate existing software entries to use new contributor structure
   - [ ] Migrate existing study authors to reference people collection
   - [ ] Migrate existing events to use new organizer/speaker structure

3. **Testing**:
   - [ ] Test hover cards with real data
   - [ ] Verify organization chips display correctly
   - [ ] Test responsive behavior on mobile
   - [ ] Validate all references resolve correctly

4. **Documentation**:
   - [ ] Create content entry guidelines for new schema
   - [ ] Document the people collection structure
   - [ ] Update contributor guidelines

## Next Immediate Steps

1. **Fix Compilation Errors**:
   ```bash
   npm run build
   # Fix any remaining TypeScript errors
   ```

2. **Test Components**:
   ```bash
   npm run dev
   # Navigate to hardware/software detail pages
   # Verify contributor display works
   ```

3. **Migrate Sample Content**:
   - Update one hardware entry to use new structure
   - Update one software entry to use new structure
   - Create corresponding people entries

4. **Create Migration Script**:
   ```typescript
   // scripts/migrate-content.ts
   // Script to automatically convert existing content to new structure
   ```

## Migration Script Template

```typescript
// scripts/migrate-contributors.ts
import { glob } from 'glob';
import { readFile, writeFile } from 'fs/promises';
import matter from 'gray-matter';

async function migrateHardware() {
  const files = await glob('src/content/hardware/**/*.{md,mdx}');
  
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const { data, content: body } = matter(content);
    
    // Transform maintainers to contributors
    if (data.maintainers) {
      data.contributors = data.maintainers.map((name: string) => ({
        type: 'person',
        id: name.toLowerCase().replace(/\s+/g, '-'),
        role: 'Maintainer',
        current: true
      }));
      delete data.maintainers;
    }
    
    // Transform institutions to organizations
    if (data.institutions) {
      data.leadOrganization = data.institutions[0]?.toLowerCase().replace(/\s+/g, '-');
      data.supportingOrganizations = data.institutions.slice(1)
        .map((inst: string) => inst.toLowerCase().replace(/\s+/g, '-'));
      delete data.institutions;
    }
    
    // Write back
    const newContent = matter.stringify(body, data);
    await writeFile(file, newContent);
  }
}
```