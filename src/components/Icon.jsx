import * as Icons from "@/icons-react";

export const Icon = ({ name, size = 24, ...props }) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    console.error(`Icon "${name}" does not exist`);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      {...props}
    />
  );
};
