"use client";
import { Card, CardContent } from "@/components/ui/card";
import { commonTexts } from "@/texts/common/common";
import Text from "@/components/text/Text";
import { Contact } from "lucide-react";

const HelpSupport = () => {
  return (
    <Card className="w-full max-w-lg sm:max-w-xl lg:max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Contact className="w-16 h-16 text-memcryptRed mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            <Text text={commonTexts.needHelp} />
          </h3>
          <p className="text-gray-600 mb-4">
            <Text text={commonTexts.helpIntro} />
          </p>
          <p className="text-lg text-gray-800 mb-6">
            <strong>
              {" "}
              <Text text={commonTexts.helpContact} />
            </strong>{" "}
            <a
              href="mailto:info@memcrypt.io"
              className="text-memcryptRed underline"
            >
              <Text text={commonTexts.helpEmail} />
            </a>
          </p>
          <p className="text-gray-600">
            <Text text={commonTexts.helpFooter1} />
            <br /> <Text text={commonTexts.helpFooter2} />
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpSupport;
